import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,                // transparent so dark CSS bg shows under rounded clip
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x050505, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);
  scene.fog = new THREE.Fog(0x050505, 8, 24);

  const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0.5, 1.55, 4.5);
  camera.lookAt(-0.4, 1.40, 0);

  // ---- Cinematic 3-point studio lighting (boosted for figure visibility) ----

  // Key light — warm, top-front-left, casts shadows
  const key = new THREE.DirectionalLight(0xfff2dc, 2.4);
  key.position.set(-3.5, 5, 3.5);
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

  // Fill light — cool, opposite side of key, lifts shadows on the figure's right
  const fill = new THREE.DirectionalLight(0xe8ecff, 1.0);
  fill.position.set(3.5, 2.0, 2.5);
  scene.add(fill);

  // Top/hair light — straight overhead, defines the head + shoulders
  const top = new THREE.DirectionalLight(0xffffff, 0.85);
  top.position.set(0, 6, 0.5);
  scene.add(top);

  // Back/rim light — behind figure, separates it from dark bg
  const back = new THREE.DirectionalLight(0xffffff, 0.95);
  back.position.set(0.5, 3, -4);
  scene.add(back);

  // Ambient lift — much higher so true blacks aren't crushed
  const ambient = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(ambient);

  // Hemisphere — soft sky/ground bias, gives subtle depth
  const hemi = new THREE.HemisphereLight(0xfff5e6, 0x202024, 0.55);
  scene.add(hemi);

  // ---- Mouse-driven point light — warm-white, picks out humanoid + particles ----
  const mouseLight = new THREE.PointLight(0xfff0d6, 1.6, 7, 1.2);
  mouseLight.position.set(2, 1.8, 2);
  scene.add(mouseLight);

  // ---- Camera-attached rim — always lights the figure from camera POV ----
  const camRim = new THREE.DirectionalLight(0xffffff, 0.85);
  camRim.position.set(-1.5, 0.6, -0.8);
  camera.add(camRim);
  // Camera-attached front fill — guarantees front-facing illumination at any angle
  const camFront = new THREE.DirectionalLight(0xfff8ec, 0.75);
  camFront.position.set(0.4, 0.5, 1.2);
  camera.add(camFront);
  scene.add(camera);

  // ---- PMREM environment for PBR reflections on the humanoid ----
  // Stronger blur so reflections don't compete with direct lighting,
  // but environment intensity boosted on the materials side via figure.js
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.06).texture;
  scene.environmentIntensity = 1.0;

  // Soft contact shadow plane
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.ShadowMaterial({ opacity: 0.32 })
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

  return { renderer, scene, camera, mouseLight };
}
