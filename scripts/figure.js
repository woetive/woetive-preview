import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const ACCENT = new THREE.Color('#D0EF00');

export async function loadFigure(scene) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync('/models/woetive-figure.glb');
  const figure = gltf.scene;

  // Auto-fit: target ~1.85m height, feet on y=0
  figure.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(figure);
  const size = new THREE.Vector3(); box.getSize(size);
  const center = new THREE.Vector3(); box.getCenter(center);
  const targetHeight = 1.85;
  const fit = targetHeight / Math.max(size.y, 0.001);
  figure.scale.setScalar(fit);
  const box2 = new THREE.Box3().setFromObject(figure);
  figure.position.x -= (box2.max.x + box2.min.x) / 2;
  figure.position.y -= box2.min.y;
  figure.position.z -= (box2.max.z + box2.min.z) / 2;

  const bones = {};
  let figureMaterial = null;

  figure.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
      const baseMap = obj.material?.map || null;
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x0A0A0A,
        roughness: 0.85,
        metalness: 0.0,
        clearcoat: 0.1,
        clearcoatRoughness: 0.9,
        sheen: 0.3,
        sheenColor: new THREE.Color(0x1a1a1a),
        map: baseMap,
        emissive: ACCENT.clone(),
        emissiveMap: baseMap,
        emissiveIntensity: 0.6,
      });
      obj.material = mat;
      figureMaterial = mat;
    }
    if (obj.isBone) bones[obj.name] = obj;
  });

  // Ensure no animation mixer is fighting our manual bone control:
  // the static GLB ships an "Armature|clip0|baselayer" clip — we never play it.

  scene.add(figure);
  return { figure, bones, figureMaterial };
}

// Idle breathing — call inside render loop
export function applyIdleBreathing(bones) {
  const spine = bones['Spine01'] || bones['Spine'];
  if (!spine) return;
  const t = performance.now() * 0.0006;
  spine.userData._idleBase ??= spine.rotation.x;
  spine.rotation.x = spine.userData._idleBase + Math.sin(t) * 0.0035;
}
