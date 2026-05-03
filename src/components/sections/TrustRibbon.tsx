import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { SceneMono } from '../SceneText';
import { copy } from '../../scene/copy';

export function TrustRibbonSection() {
  const ribbonRef = useRef<THREE.Group>(null);
  const items = copy.trust.items.join('   ✦   ');
  const repeated = `${items}   ✦   ${items}`;

  useFrame(() => {
    if (!ribbonRef.current) return;
    // Slow horizontal drift of the marquee text
    const t = performance.now() * 0.0001;
    ribbonRef.current.position.x = -t * 0.4 % 12;
  });

  return (
    <group>
      {/* Light wall */}
      <mesh position={[0, 0, -68]}>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#F4F3EE" roughness={0.95} />
      </mesh>
      <SceneMono position={[0, 0.85, -67]} fontSize={0.07} color="#5C5C57" anchorX="center">
        {copy.trust.eyebrow}
      </SceneMono>
      <group ref={ribbonRef} position={[0, 0, -67.1]}>
        <SceneMono position={[0, 0, 0]} fontSize={0.32} color="#0B0B0A" letterSpacing={0.08} anchorX="center" maxWidth={40}>
          {repeated}
        </SceneMono>
      </group>
    </group>
  );
}
