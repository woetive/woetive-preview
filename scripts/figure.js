import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function loadFigure(scene) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync('/models/woetive-figure.glb');
  const model = gltf.scene;

  // Auto-fit: target 1.85m tall standing figure with feet on y=0
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3(); box.getSize(size);
  const targetHeight = 1.85;
  const fit = targetHeight / Math.max(size.y, 0.001);
  model.scale.setScalar(fit);

  const box2 = new THREE.Box3().setFromObject(model);
  model.position.x -= (box2.max.x + box2.min.x) / 2;
  model.position.y -= box2.min.y;
  model.position.z -= (box2.max.z + box2.min.z) / 2;

  // Enable shadows + keep the original Tripo PBR material; just ensure env intensity is sane
  model.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.castShadow = true;
    obj.receiveShadow = true;
    if (obj.material && 'envMapIntensity' in obj.material) {
      obj.material.envMapIntensity = 1.0;
    }
  });

  // Wrap in a parent group so we can rotate the entire figure for mouse-follow
  // without disturbing the auto-fit transform on the model itself.
  const group = new THREE.Group();
  group.add(model);
  group.position.y = 0;
  scene.add(group);

  return { figureGroup: group, figureModel: model };
}
