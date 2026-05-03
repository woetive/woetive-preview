import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Props = {
  groupRef: React.RefObject<THREE.Group>;
  count?: number;
  radius?: number;
  cursor: React.RefObject<{ x: number; y: number }>;
};

// AI mind-map sphere: Fibonacci-distributed points + thin connector lines
// between near neighbours. Static topology, so per-frame work is just the
// parent group's rotation.
export function ParticleMindMap({ groupRef, count = 200, radius = 1.55, cursor }: Props) {
  const data = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const golden = Math.PI * (1 + Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / count);
      const theta = golden * i;
      const r = radius * (0.55 + Math.random() * 0.55);
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    // Connector lines between any two points within MAX_DIST
    const MAX = 0.46, MAX_SQ = MAX * MAX;
    const lineVerts: number[] = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = positions[i * 3]     - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < MAX_SQ) {
          lineVerts.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
          lineVerts.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
        }
      }
    }
    // ~8% lime accent points
    const accentN = Math.floor(count * 0.08);
    const accent = new Float32Array(accentN * 3);
    for (let i = 0; i < accentN; i++) {
      const idx = Math.floor(Math.random() * count);
      accent[i * 3]     = positions[idx * 3];
      accent[i * 3 + 1] = positions[idx * 3 + 1];
      accent[i * 3 + 2] = positions[idx * 3 + 2];
    }
    return { positions, lineVerts: new Float32Array(lineVerts), accent };
  }, [count, radius]);

  const pointsMat = useMemo(() => new THREE.PointsMaterial({
    color: 0xF4F3EE, size: 0.022, sizeAttenuation: true,
    transparent: true, opacity: 0.85, depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);
  const lineMat = useMemo(() => new THREE.LineBasicMaterial({
    color: 0xF4F3EE, transparent: true, opacity: 0.10, depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);
  const accentMat = useMemo(() => new THREE.PointsMaterial({
    color: 0xD0EF00, size: 0.038, sizeAttenuation: true,
    transparent: true, opacity: 0.85, depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  // Sync opacity with the cloud's userData.opacity (driven by camera path)
  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    const op = (g.userData.opacity as number | undefined) ?? 1;
    pointsMat.opacity = 0.85 * op;
    lineMat.opacity   = 0.10 * op;
    accentMat.opacity = 0.85 * op;
    const t = performance.now() * 0.00012;
    g.rotation.y = t * 1.4 + (cursor.current?.x ?? 0) * 0.4;
    g.rotation.x = Math.sin(t * 0.7) * 0.12 - (cursor.current?.y ?? 0) * 0.20;
    const breath = 1 + Math.sin(t * 1.6) * 0.012;
    g.scale.setScalar(breath);
  });

  return (
    <group ref={groupRef} position={[-0.45, 1.10, -3.15]}>
      <points material={pointsMat}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        </bufferGeometry>
      </points>
      <lineSegments material={lineMat}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.lineVerts, 3]} />
        </bufferGeometry>
      </lineSegments>
      <points material={accentMat}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.accent, 3]} />
        </bufferGeometry>
      </points>
    </group>
  );
}
