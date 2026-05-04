import * as THREE from "three";

export type QuadConfig = {
  vertexShader: string;
  fragmentShader: string;
  uniforms?: Record<string, THREE.IUniform>;
};

export function createFullscreenQuad(config: QuadConfig) {
  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    vertexShader: config.vertexShader,
    fragmentShader: config.fragmentShader,
    uniforms: config.uniforms ?? {},
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  return { mesh, material, geometry };
}
