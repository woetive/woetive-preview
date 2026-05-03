import { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MODEL_URL = '/models/woetive-figure.glb';
const DRACO_PATH = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/';

// Preload using drei's built-in DRACO support (passing path string enables it)
useGLTF.preload(MODEL_URL, DRACO_PATH);

type Props = {
  groupRef: React.RefObject<THREE.Group>;
  limeMatRef: React.MutableRefObject<THREE.MeshStandardMaterial | null>;
  cursor: React.RefObject<{ x: number; y: number }>;
};

export function Humanoid({ groupRef, limeMatRef, cursor }: Props) {
  const gltf = useGLTF(MODEL_URL, DRACO_PATH) as unknown as { scene: THREE.Group };

  // Process the model once: face camera (-90° Y), auto-fit, matte material
  const cloned = useMemo(() => {
    const root = gltf.scene.clone(true);
    root.rotation.y = -Math.PI / 2;
    root.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3(); box.getSize(size);
    const fit = 1.85 / Math.max(size.y, 0.001);
    root.scale.setScalar(fit);
    const box2 = new THREE.Box3().setFromObject(root);
    root.position.x -= (box2.max.x + box2.min.x) / 2;
    root.position.y -= box2.min.y;
    root.position.z -= (box2.max.z + box2.min.z) / 2;

    root.traverse((obj) => {
      const m = obj as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      const orig = m.material as THREE.MeshStandardMaterial | undefined;
      m.material = new THREE.MeshStandardMaterial({
        color: 0x080808,
        roughness: 0.84,
        metalness: 0.04,
        normalMap: orig?.normalMap || null,
        envMapIntensity: 0.6,
      });
    });
    return root;
  }, [gltf]);

  // Lime chest line — separate emissive plane mesh
  const limeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xD0EF00,
    emissive: 0xD0EF00,
    emissiveIntensity: 1.15,
    roughness: 0.35,
    metalness: 0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.95,
  }), []);

  useEffect(() => {
    limeMatRef.current = limeMat;
    return () => { limeMatRef.current = null; };
  }, [limeMat, limeMatRef]);

  // Continuous breath + cursor parallax on top of base rotation set by CameraRig
  const lastBaseRot = useRef(0);
  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    const t = performance.now() * 0.0001;
    const breathY = Math.sin(t) * 0.020;
    const breathX = Math.cos(t * 0.6) * 0.010;
    const baseRot = (g.userData.baseRotY as number | undefined) ?? lastBaseRot.current;
    lastBaseRot.current = baseRot;
    g.rotation.y = baseRot + breathY + (cursor.current?.x ?? 0) * 0.16;
    g.rotation.x = breathX + (cursor.current?.y ?? 0) * 0.04;
  });

  return (
    <group ref={groupRef} position={[1.05, -0.95, -2.20]} scale={1.95}>
      <primitive object={cloned} />
      <mesh position={[0, 1.10, 0.13]} material={limeMat}>
        <planeGeometry args={[0.018, 0.62]} />
      </mesh>
    </group>
  );
}
