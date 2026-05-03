import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: false,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#FFFFFF');
  scene.fog = new THREE.Fog('#FFFFFF', 8, 20);

  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.65, 2.0);
  camera.lookAt(0, 1.65, 0);

  // ---- Static studio key + ambient (world space) ----
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(-3, 5, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0001;
  key.shadow.camera.left = -3;
  key.shadow.camera.right = 3;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -1;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 14;
  scene.add(key);

  const ambient = new THREE.AmbientLight(0xffffff, 0.30);
  scene.add(ambient);

  // ---- Camera-attached lights — keep figure properly lit at every angle ----
  // These ride with the camera (added as children) so the figure is never
  // unlit during 360° orbits or wide pull-backs.
  const camFill = new THREE.DirectionalLight(0xffffff, 0.55);
  camFill.position.set(0.5, 0.5, 1.5);    // slightly off-center toward camera POV
  camera.add(camFill);

  const camRim = new THREE.DirectionalLight(0xfafff0, 0.45);
  camRim.position.set(-1.2, 0.8, -0.5);   // rim from camera's upper-left back
  camera.add(camRim);

  // Camera must be in scene graph for its child lights to render
  scene.add(camera);

  // PMREM env for subtle PBR reflections
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // Soft contact shadow plane — invisible, only receives shadows
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.ShadowMaterial({ opacity: 0.18 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  addEventListener('resize', onResize, { passive: true });

  return { renderer, scene, camera };
}
