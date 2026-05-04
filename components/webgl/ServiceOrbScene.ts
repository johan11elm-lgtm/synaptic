import * as THREE from "three";
import { Clock } from "@/lib/webgl/clock";
import bgFragment from "@/shaders/service-bg/main.frag";
import bgVertex from "@/shaders/service-bg/main.vert";
import orbFragment from "@/shaders/service-orb/main.frag";
import orbVertex from "@/shaders/service-orb/main.vert";

// Per-card iridescent orb cluster — main bubble + a smaller satellite that
// orbits around it on a tilted plane (same trick monopo uses on each section).
// Same Fresnel + chromatic-dispersion technique as LensScene, simplified:
// no global pointer, per-instance palette so each service reads distinct.

export type ServicePalette = {
  colorA: THREE.ColorRepresentation;
  colorB: THREE.ColorRepresentation;
  colorC: THREE.ColorRepresentation;
};

export type ServiceGlass = {
  tint: THREE.ColorRepresentation;
  tintAmount: number;
  rimColor: THREE.ColorRepresentation;
  rimIntensity: number;
  rimPower: number;
  refractionPower: number;
};

const DEFAULT_GLASS: ServiceGlass = {
  tint: 0x0d1622,
  tintAmount: 0.32,
  rimColor: 0xffffff,
  rimIntensity: 0.4,
  rimPower: 3.0,
  refractionPower: 0.78,
};

// Per-service motion preset. Drives both the main orb's drift and the
// satellite's orbit so each card has its own rhythm.
export type ServiceMotion = {
  drift: {
    ampX: number;
    ampY: number;
    freqX: number;
    freqY: number;
    rotSpeed: number;
  };
  orbit: {
    speed: number;
    radiusX: number;
    radiusY: number;
    radiusZ: number;
    phaseOffset: number;
  };
};

const CUBE_RT_SIZE = 192;

export class ServiceOrbScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly bgMesh: THREE.Mesh;
  private readonly bgMaterial: THREE.ShaderMaterial;
  private readonly bgGeometry: THREE.SphereGeometry;
  private readonly orbMesh: THREE.Mesh;
  private readonly satelliteMesh: THREE.Mesh;
  private readonly orbMaterial: THREE.ShaderMaterial;
  private readonly orbGeometry: THREE.SphereGeometry;
  private readonly cubeRenderTarget: THREE.WebGLCubeRenderTarget;
  private readonly cubeCamera: THREE.CubeCamera;
  private readonly clock: Clock;
  private readonly resizeObserver: ResizeObserver;
  private hover = 0;
  private hoverTarget = 0;
  // Base centre opacity — set from the active theme's glass.refractionPower.
  // The update tick adds the hover lerp on top so the orb gets denser when
  // the card is hovered.
  private baseRefractionPower = 0.78;
  private readonly motion: ServiceMotion;
  // Compact bubble — the satellite orbits around it, so leave room.
  private readonly baseScale = 0.7;
  // Satellite is ~38% the size of the main orb, like the small companion
  // bubble next to monopo's lettered sphere.
  private readonly satelliteScale = 0.27;

  constructor(
    canvas: HTMLCanvasElement,
    palette: ServicePalette,
    motion: ServiceMotion,
    glass: ServiceGlass = DEFAULT_GLASS,
  ) {
    this.motion = motion;
    this.baseRefractionPower = glass.refractionPower;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    // Pulled back from z=4 to z=4.8 — gives the satellite ~20% more room so
    // its orbit + the main orb's drift don't clip at the canvas edges.
    this.camera.position.set(0, 0, 4.8);
    // Main camera only sees layer 1 (the orb). The bg sphere lives on layer 0
    // and is captured by the CubeCamera (default mask = layer 0) for refraction
    // sampling — but never drawn to the visible canvas. The page bg shows
    // through around the orb; the orb itself is opaque (forced alpha = 1 in
    // the fragment shader, see service-orb/main.frag.ts) so it reads as a
    // solid object on the page rather than a transparent ghost.
    this.camera.layers.set(1);

    this.bgGeometry = new THREE.SphereGeometry(1, 48, 48);
    this.bgMaterial = new THREE.ShaderMaterial({
      vertexShader: bgVertex,
      fragmentShader: bgFragment,
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uGrainStrength: { value: 0.05 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uColorA: { value: new THREE.Color(palette.colorA) },
        uColorB: { value: new THREE.Color(palette.colorB) },
        uColorC: { value: new THREE.Color(palette.colorC) },
      },
    });
    this.bgMesh = new THREE.Mesh(this.bgGeometry, this.bgMaterial);
    this.bgMesh.scale.setScalar(20);
    this.scene.add(this.bgMesh);

    this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(CUBE_RT_SIZE, {
      generateMipmaps: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });
    this.cubeCamera = new THREE.CubeCamera(0.1, 100, this.cubeRenderTarget);
    this.scene.add(this.cubeCamera);

    this.orbGeometry = new THREE.SphereGeometry(1, 96, 96);
    this.orbMaterial = new THREE.ShaderMaterial({
      vertexShader: orbVertex,
      fragmentShader: orbFragment,
      uniforms: {
        tCube: { value: this.cubeRenderTarget.texture },
        uSphereAlpha: { value: 1.0 },
        uRefractionPower: { value: glass.refractionPower },
        // Same dark-glass settings as LensScene — every orb in the page
        // shares one identity (metallic rim, dispersive fringe, tinted core).
        // Only the cubemap behind it changes per service.
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
    this.orbMesh.scale.setScalar(this.baseScale);
    // Orb on layer 1 so the CubeCamera (default layer 0) ignores it when
    // capturing the bg into the env map.
    this.orbMesh.layers.set(1);
    this.scene.add(this.orbMesh);

    // Satellite — same geometry + material so both bubbles share the cubemap
    // and render identically; only scale and orbit position differ.
    this.satelliteMesh = new THREE.Mesh(this.orbGeometry, this.orbMaterial);
    this.satelliteMesh.scale.setScalar(this.satelliteScale);
    this.satelliteMesh.layers.set(1);
    this.scene.add(this.satelliteMesh);

    this.clock = new Clock(this.update);

    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(canvas);
    this.handleResize();
  }

  setHover(active: boolean) {
    this.hoverTarget = active ? 1 : 0;
  }

  // Live-swap colours / glass without recreating the renderer — used by the
  // theme toggle so each card updates in place instead of remounting.
  updatePalette(palette: ServicePalette, glass: ServiceGlass) {
    (this.bgMaterial.uniforms.uColorA.value as THREE.Color).set(palette.colorA);
    (this.bgMaterial.uniforms.uColorB.value as THREE.Color).set(palette.colorB);
    (this.bgMaterial.uniforms.uColorC.value as THREE.Color).set(palette.colorC);
    (this.orbMaterial.uniforms.uGlassTint.value as THREE.Color).set(glass.tint);
    this.orbMaterial.uniforms.uTintAmount.value = glass.tintAmount;
    (this.orbMaterial.uniforms.uRimColor.value as THREE.Color).set(glass.rimColor);
    this.orbMaterial.uniforms.uRimIntensity.value = glass.rimIntensity;
    this.orbMaterial.uniforms.uRimPower.value = glass.rimPower;
    // Update the BASE; the next update tick will apply hover lerp on top.
    this.baseRefractionPower = glass.refractionPower;
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
    this.hover += (this.hoverTarget - this.hover) * 0.06;

    const { drift, orbit } = this.motion;

    // Main orb — drift amplitudes/frequencies are per-service so each card
    // has its own breathing rhythm.
    this.orbMesh.rotation.y = elapsed * drift.rotSpeed;
    this.orbMesh.rotation.x = Math.sin(elapsed * drift.freqY * 0.74) * 0.35;
    this.orbMesh.position.x = Math.sin(elapsed * drift.freqX) * drift.ampX;
    this.orbMesh.position.y = Math.cos(elapsed * drift.freqY) * drift.ampY;
    this.orbMesh.scale.setScalar(this.baseScale + this.hover * 0.08);

    // Satellite — independent orbit. radiusZ controls how much it crosses in
    // front of / behind the main orb; phaseOffset desynchronises the cards.
    const orbitT = elapsed * orbit.speed + orbit.phaseOffset;
    this.satelliteMesh.position.x = this.orbMesh.position.x + Math.cos(orbitT) * orbit.radiusX;
    this.satelliteMesh.position.y = this.orbMesh.position.y + Math.sin(orbitT) * orbit.radiusY;
    this.satelliteMesh.position.z = Math.sin(orbitT * 1.13) * orbit.radiusZ;
    this.satelliteMesh.rotation.y = elapsed * (orbit.speed + 0.2);
    this.satelliteMesh.rotation.x = Math.cos(elapsed * orbit.speed * 0.8) * 0.5;
    this.satelliteMesh.scale.setScalar(this.satelliteScale + this.hover * 0.04);

    (this.orbMaterial.uniforms.uRefractionPower.value as number) =
      this.baseRefractionPower + this.hover * 0.18;

    this.bgMaterial.uniforms.uTime.value = elapsed;

    // Cube render: zero grain so the orb picks up a clean cubemap.
    this.bgMaterial.uniforms.uGrainStrength.value = 0.0;
    this.cubeCamera.position.copy(this.orbMesh.position);
    this.cubeCamera.update(this.renderer, this.scene);

    // Main pass: light grain restored so the canvas itself doesn't band.
    this.bgMaterial.uniforms.uGrainStrength.value = 0.05;
    this.renderer.render(this.scene, this.camera);
  };
}
