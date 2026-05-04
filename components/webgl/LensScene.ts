import * as THREE from "three";
import { Clock } from "@/lib/webgl/clock";
import bgFragment from "@/shaders/lens-bg/main.frag";
import bgVertex from "@/shaders/lens-bg/main.vert";
import orbFragment from "@/shaders/lens-orb/main.frag";
import orbVertex from "@/shaders/lens-orb/main.vert";

// Inspired by the technique on monopo.vn:
//   1. Big inside-out sphere renders a procedural gradient as the world background.
//   2. A CubeCamera at the centre captures that background into a cubeRenderTarget.
//   3. The visible orb samples the cubemap with chromatically-shifted refraction
//      vectors + Fresnel reflection, producing a glassy lens that "sees" the bg.

type Palette = {
  baseFirst: THREE.ColorRepresentation;
  baseSecond: THREE.ColorRepresentation;
  baseThird: THREE.ColorRepresentation;
  accent: THREE.ColorRepresentation;
};

type Glass = {
  tint: THREE.ColorRepresentation;
  tintAmount: number;
  rimColor: THREE.ColorRepresentation;
  rimIntensity: number;
  rimPower: number;
  refractionPower: number;
};

// Crystal Reflections palette. Two saturated cool hues (cyan glacier +
// pale lavender) sit at opposite ends of the cool spectrum on a deep
// indigo baseline. The cool gap between them is what the orb's chromatic
// dispersion (R/G/B refract on different vectors) splits into a visible
// iris at the rim — pick monochrome cyan and you'd lose the iridescence.
const DEFAULT_PALETTE: Palette = {
  baseFirst: 0x88e1ff, // cyan glacier — main blob colour
  baseSecond: 0xc8a8ff, // pale lavender — secondary blobs
  baseThird: 0xe6f4ff, // pearly sparkle pockets
  accent: 0x0a1828, // deep indigo — baseline of the bg
};

const DEFAULT_GLASS: Glass = {
  tint: 0x0d1622,
  tintAmount: 0.32,
  rimColor: 0xffffff,
  rimIntensity: 0.4,
  rimPower: 3.0,
  refractionPower: 0.75,
};

const CUBE_RT_SIZE = 256;

export class LensScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly bgMesh: THREE.Mesh;
  private readonly bgMaterial: THREE.ShaderMaterial;
  private readonly bgGeometry: THREE.SphereGeometry;
  private readonly orbMesh: THREE.Mesh;
  private readonly orbMaterial: THREE.ShaderMaterial;
  private readonly orbGeometry: THREE.SphereGeometry;
  private readonly cubeRenderTarget: THREE.WebGLCubeRenderTarget;
  private readonly cubeCamera: THREE.CubeCamera;
  private readonly clock: Clock;
  private readonly resizeObserver: ResizeObserver;
  private readonly pointer = new THREE.Vector2(0, 0);
  private readonly pointerTarget = new THREE.Vector2(0, 0);
  private readonly cameraLook = new THREE.Vector3(0, 0, 0);

  constructor(
    canvas: HTMLCanvasElement,
    palette: Palette = DEFAULT_PALETTE,
    glass: Glass = DEFAULT_GLASS,
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 1);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(0, 0, 4);
    this.camera.layers.enableAll();

    // --- Background sphere (inside-out) ---
    this.bgGeometry = new THREE.SphereGeometry(1, 64, 64);
    this.bgMaterial = new THREE.ShaderMaterial({
      vertexShader: bgVertex,
      fragmentShader: bgFragment,
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uZoom: { value: 1.0 },
        uBaseFrequency: { value: 1.0 },
        uAccentOpacity: { value: 1.0 },
        uOpacity: { value: 1.0 },
        uProgress: { value: 1.0 },
        uGrainStrength: { value: 0.07 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uBaseFirstColor: { value: new THREE.Color(palette.baseFirst) },
        uBaseSecondColor: { value: new THREE.Color(palette.baseSecond) },
        uBaseThirdColor: { value: new THREE.Color(palette.baseThird) },
        uAccentColor: { value: new THREE.Color(palette.accent) },
      },
    });
    this.bgMesh = new THREE.Mesh(this.bgGeometry, this.bgMaterial);
    this.bgMesh.scale.setScalar(20);
    this.scene.add(this.bgMesh);

    // --- CubeCamera that captures the bg into an env map ---
    this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(CUBE_RT_SIZE, {
      generateMipmaps: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });
    this.cubeCamera = new THREE.CubeCamera(0.1, 100, this.cubeRenderTarget);
    this.scene.add(this.cubeCamera);

    // --- Refractive orb ---
    this.orbGeometry = new THREE.SphereGeometry(1, 96, 96);
    this.orbMaterial = new THREE.ShaderMaterial({
      vertexShader: orbVertex,
      fragmentShader: orbFragment,
      uniforms: {
        tCube: { value: this.cubeRenderTarget.texture },
        uSphereAlpha: { value: 1.0 },
        uRefractionPower: { value: glass.refractionPower },
        // Refraction ratio kept strong; Fresnel boosted so the rim reads as
        // a hard metallic edge. Tint absorbs the refraction (not the
        // reflection) — this is what makes the orb feel like dark glass.
        mRefractionRatio: { value: 0.016 },
        mFresnelBias: { value: 0.05 },
        mFresnelScale: { value: 3.0 },
        mFresnelPower: { value: 5.5 },
        uGlassTint: { value: new THREE.Color(glass.tint) },
        uTintAmount: { value: glass.tintAmount },
        // Additive rim highlight on top of the refraction/reflection mix.
        uRimColor: { value: new THREE.Color(glass.rimColor) },
        uRimIntensity: { value: glass.rimIntensity },
        uRimPower: { value: glass.rimPower },
      },
    });
    this.orbMesh = new THREE.Mesh(this.orbGeometry, this.orbMaterial);
    this.orbMesh.scale.setScalar(2.4);
    // Anchor outside the top-right corner — only the lower-left arc of the orb
    // is visible in the viewport, like the monopo.vn desktop hero.
    this.orbMesh.position.set(1.4, 1.0, 0);
    // Orb lives on layer 1; the cube camera (default layer 0) ignores it.
    this.orbMesh.layers.set(1);
    this.scene.add(this.orbMesh);

    this.clock = new Clock(this.update);

    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(canvas);
    this.handleResize();
  }

  setPointer(nx: number, ny: number) {
    // Caller passes normalised device coords (-1..1).
    this.pointerTarget.set(nx, ny);
  }

  // Live-swap colours / glass without recreating the renderer or recompiling
  // shaders — used by the theme toggle so the transition is a uniform update,
  // not a full remount.
  updatePalette(palette: Palette, glass: Glass) {
    (this.bgMaterial.uniforms.uBaseFirstColor.value as THREE.Color).set(palette.baseFirst);
    (this.bgMaterial.uniforms.uBaseSecondColor.value as THREE.Color).set(palette.baseSecond);
    (this.bgMaterial.uniforms.uBaseThirdColor.value as THREE.Color).set(palette.baseThird);
    (this.bgMaterial.uniforms.uAccentColor.value as THREE.Color).set(palette.accent);
    (this.orbMaterial.uniforms.uGlassTint.value as THREE.Color).set(glass.tint);
    this.orbMaterial.uniforms.uTintAmount.value = glass.tintAmount;
    (this.orbMaterial.uniforms.uRimColor.value as THREE.Color).set(glass.rimColor);
    this.orbMaterial.uniforms.uRimIntensity.value = glass.rimIntensity;
    this.orbMaterial.uniforms.uRimPower.value = glass.rimPower;
    this.orbMaterial.uniforms.uRefractionPower.value = glass.refractionPower;
  }

  start() {
    this.clock.start();
  }

  stop() {
    this.clock.stop();
  }

  dispose() {
    this.stop();
    this.resizeObserver.disconnect();
    this.bgGeometry.dispose();
    this.bgMaterial.dispose();
    this.orbGeometry.dispose();
    this.orbMaterial.dispose();
    this.cubeRenderTarget.dispose();
    this.renderer.dispose();
  }

  private handleResize = () => {
    const canvas = this.renderer.domElement;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    (this.bgMaterial.uniforms.uResolution.value as THREE.Vector2).set(w, h);
  };

  private update = (elapsed: number) => {
    // Slow lerp (0.04) gives a "trailing" feel — pointer moves crisply, the
    // scene catches up over a few frames instead of locking 1:1.
    this.pointer.lerp(this.pointerTarget, 0.04);

    // Orb drift — slightly bumped over the camera-tilt baseline so the
    // sphere itself moves a touch more independently of the global parallax.
    this.orbMesh.position.x = 1.4 + this.pointer.x * -0.75;
    this.orbMesh.position.y = 1.0 + this.pointer.y * -0.55;
    this.orbMesh.rotation.y = elapsed * 0.12 + this.pointer.x * 0.95;
    this.orbMesh.rotation.x = this.pointer.y * -0.7;

    // Global camera tilt — bg + orb parallax together. Negative amplitudes:
    // the frame leans AWAY from the cursor (look-around feel, not drag-along).
    this.cameraLook.set(this.pointer.x * -0.6, this.pointer.y * -0.4, 0);
    this.camera.lookAt(this.cameraLook);

    this.bgMaterial.uniforms.uTime.value = elapsed * 1.2;

    // Cube render: zero grain so the orb picks up a clean cubemap.
    this.bgMaterial.uniforms.uGrainStrength.value = 0.0;
    this.cubeCamera.position.copy(this.orbMesh.position);
    this.cubeCamera.update(this.renderer, this.scene);

    // Main pass: visible film-stock grain in the bg shader.
    this.bgMaterial.uniforms.uGrainStrength.value = 0.07;
    this.renderer.render(this.scene, this.camera);
  };
}
