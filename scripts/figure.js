import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const DRACO_DECODER_PATH = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/';
const ACCENT = new THREE.Color(0xD0EF00);

export async function loadFigure(scene) {
  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath(DRACO_DECODER_PATH);
  draco.setDecoderConfig({ type: 'js' });
  loader.setDRACOLoader(draco);

  const gltf = await loader.loadAsync('/models/woetive-figure.glb');
  const model = gltf.scene;

  // Auto-fit to ~1.85m tall, feet on y=0
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

  // Override material — matte black per brief: roughness 0.82, metalness 0.04
  // We KEEP the original PBR map for normal/roughness detail though, by extending
  // rather than replacing entirely.
  model.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.castShadow = true;
    obj.receiveShadow = true;
    const orig = obj.material;
    const replaced = new THREE.MeshStandardMaterial({
      color: 0x080808,
      roughness: 0.82,
      metalness: 0.04,
      envMapIntensity: 0.6,
      // Inherit normal/baseMap if present so the surface keeps its anatomical detail
      normalMap: orig?.normalMap || null,
      map: null,    // override base color — texture was too saturated for our matte look
    });
    obj.material = replaced;
  });

  // Wrap in parent group so we can rotate/translate the entire figure independently
  const group = new THREE.Group();
  group.add(model);
  group.position.y = 0;

  // ---- Lime chest line — separate emissive mesh, parented to group ----
  // Thin vertical strip running from upper chest to belly. Sits slightly forward
  // of the body so it always reads against the matte surface.
  const limeGeo = new THREE.PlaneGeometry(0.018, 0.62);
  const limeMat = new THREE.MeshStandardMaterial({
    color: 0xD0EF00,
    emissive: 0xD0EF00,
    emissiveIntensity: 1.6,
    roughness: 0.35,
    metalness: 0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.95,
  });
  const limeLine = new THREE.Mesh(limeGeo, limeMat);
  limeLine.position.set(0, 1.10, 0.13);  // chest center, just in front of body
  group.add(limeLine);
  group.userData.limeMaterial = limeMat;

  scene.add(group);
  draco.dispose();

  return { figureGroup: group, figureModel: model, limeMaterial: limeMat };
}
