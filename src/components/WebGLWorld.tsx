import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { Humanoid } from './Humanoid';
import { ParticleMindMap } from './ParticleMindMap';
import { CameraRig } from './CameraRig';
import { HeroSection } from './sections/Hero';

type Props = {
  scrollRef: React.RefObject<number>;
  cursor: React.RefObject<{ x: number; y: number }>;
};

export function WebGLWorld({ scrollRef, cursor }: Props) {
  const figureGroupRef    = useRef<THREE.Group>(null);
  const particlesGroupRef = useRef<THREE.Group>(null);
  const limeMatRef        = useRef<THREE.MeshStandardMaterial | null>(null);

  return (
    <Canvas
      shadows
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, Math.min(window.devicePixelRatio, 1.75)]}
      camera={{ fov: 38, near: 0.1, far: 200, position: [0.55, 1.25, 4.8] }}
    >
      <Suspense fallback={null}>
        {/* Studio lighting — warm, no blue, no sci-fi */}
        <directionalLight
          position={[-3.5, 5, 3.5]} intensity={1.4} color="#fff5e6"
          castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001}
        />
        <directionalLight position={[3.0, 1.5, 3]} intensity={0.18} color="#f0f0ff" />
        <ambientLight intensity={0.08} />

        <Environment preset="apartment" environmentIntensity={0.4} />

        {/* Soft contact shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial opacity={0.32} />
        </mesh>

        {/* World objects */}
        <Humanoid groupRef={figureGroupRef} limeMatRef={limeMatRef} cursor={cursor} />
        <ParticleMindMap groupRef={particlesGroupRef} cursor={cursor} />

        {/* Hero is the only section that lives in 3D space */}
        <HeroSection />

        <CameraRig
          scrollRef={scrollRef}
          figureGroupRef={figureGroupRef}
          particlesGroupRef={particlesGroupRef}
          limeMatRef={limeMatRef}
        />
      </Suspense>
    </Canvas>
  );
}
