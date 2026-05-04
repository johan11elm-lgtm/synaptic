// Samples the env cubemap 3 times along R/G/B-shifted refraction vectors
// to produce chromatic dispersion, then mixes with the reflection sample
// weighted by the precomputed Fresnel factor.
const fragmentShader = /* glsl */ `
  precision highp float;

  uniform samplerCube tCube;
  uniform float uSphereAlpha;
  uniform float uRefractionPower;
  uniform vec3  uGlassTint;
  uniform float uTintAmount;
  uniform vec3  uRimColor;
  uniform float uRimIntensity;

  varying vec3  vReflect;
  varying vec3  vRefract[3];
  varying float vReflectionFactor;
  varying float vRim;

  void main() {
    // Three.js cubeRenderTarget is right-handed; textureCube expects left-handed,
    // so x is flipped on each sample.
    vec4 reflectedColor = textureCube(tCube, vec3(-vReflect.x, vReflect.yz));

    vec4 refractedColor = vec4(1.0);
    refractedColor.r = textureCube(tCube, vec3(-vRefract[0].x, vRefract[0].yz)).r;
    refractedColor.g = textureCube(tCube, vec3(-vRefract[1].x, vRefract[1].yz)).g;
    refractedColor.b = textureCube(tCube, vec3(-vRefract[2].x, vRefract[2].yz)).b;
    refractedColor.a = uRefractionPower;

    // Dark-glass tint — absorbs the refraction only. The reflection stays
    // at full brightness so the Fresnel rim reads metallic, while what we
    // see THROUGH the glass is darkened toward uGlassTint.
    vec3 refractedRGB = mix(refractedColor.rgb, uGlassTint, uTintAmount);

    gl_FragColor = mix(
      vec4(refractedRGB, refractedColor.a),
      reflectedColor * uSphereAlpha,
      clamp(vReflectionFactor, 0.0, 1.0)
    );

    // Additive rim highlight — concentrates the perceived reflection on
    // the silhouette edge without touching the refraction/reflection mix
    // (so chromatic dispersion keeps its band width).
    gl_FragColor.rgb += uRimColor * vRim * uRimIntensity;
  }
`;

export default fragmentShader;
