// Standard Fresnel + chromatic-dispersion refraction setup
// (same technique as shaders/lens-orb — pre-computes reflect/refract vectors per vertex).
const vertexShader = /* glsl */ `
  uniform float mRefractionRatio;
  uniform float mFresnelBias;
  uniform float mFresnelScale;
  uniform float mFresnelPower;
  uniform float uRimPower;

  varying vec3  vReflect;
  varying vec3  vRefract[3];
  varying float vReflectionFactor;
  varying float vRim;

  void main() {
    vec4 mvPosition    = modelViewMatrix * vec4(position, 1.0);
    vec4 worldPosition = modelMatrix    * vec4(position, 1.0);

    vec3 worldNormal = normalize(
      mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal
    );

    vec3 I = worldPosition.xyz - cameraPosition;

    vReflect    = reflect(I, worldNormal);
    // Dispersion widened (0.95 / 0.91 instead of 0.99 / 0.98) — the larger
    // gap between the per-channel refraction ratios produces visible
    // chromatic fringes on the rim instead of the previous near-imperceptible
    // separation.
    vRefract[0] = refract(normalize(I), worldNormal, mRefractionRatio);
    vRefract[1] = refract(normalize(I), worldNormal, mRefractionRatio * 0.95);
    vRefract[2] = refract(normalize(I), worldNormal, mRefractionRatio * 0.91);

    // Schlick-style Fresnel approximation.
    vReflectionFactor = mFresnelBias + mFresnelScale
      * pow(1.0 + dot(normalize(I), worldNormal), mFresnelPower);

    // Independent rim term — same Schlick base, separate exponent so the
    // additive edge highlight in the fragment can be tuned without
    // narrowing the dispersion-mix band.
    vRim = pow(clamp(1.0 + dot(normalize(I), worldNormal), 0.0, 1.0), uRimPower);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

export default vertexShader;
