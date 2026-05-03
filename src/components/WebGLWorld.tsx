import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { Humanoid } from './Humanoid';
import { ParticleMindMap } from './ParticleMindMap';
import { CameraRig } from './CameraRig';
import { HeroSection } from './sections/Hero';
import { ManifestoSection } from './sections/Manifesto';
import { CloseupSection } from './sections/Closeup';
import { WorkSection } from './sections/Work';
import { MethodInterludeSection } from './sections/MethodInterlude';
import { MethodStepsSection } from './sections/MethodSteps';
import { TrustRibbonSection } from './sections/TrustRibbon';
import { WhyWoetiveSection } from './sections/WhyWoetive';
import { TestimonialsSection } from './sections/Testimonials';
import { FoundersSection } from './sections/Founders';
import { ContactSection } from './sections/Contact';
import { FooterSection } from './sections/Footer';

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
      className="world-canvas-inner"
      shadows
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, Math.min(window.devicePixelRatio, 1.75)]}
      camera={{ fov: 38, near: 0.1, far: 200, position: [0.55, 1.25, 4.8] }}
    >
      <Suspense fallback={null}>
        {/* ---- Studio lighting (no blue / no sci-fi) ---- */}
        <directionalLight position={[-3.5, 5, 3.5]} intensity={1.4} color="#fff5e6" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />
        <directionalLight position={[ 3.0, 1.5, 3]} intensity={0.18} color="#f0f0ff" />
        <ambientLight intensity={0.07} />

        {/* PMREM environment for PBR reflections on the matte humanoid */}
        <Environment preset="apartment" environmentIntensity={0.4} />

        {/* Soft contact shadow plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial opacity={0.32} />
        </mesh>

        {/* The world objects */}
        <Humanoid groupRef={figureGroupRef} limeMatRef={limeMatRef} cursor={cursor} />
        <ParticleMindMap groupRef={particlesGroupRef} cursor={cursor} />

        {/* All sections placed in 3D space */}
        <HeroSection />
        <ManifestoSection />
        <CloseupSection />
        <WorkSection />
        <MethodInterludeSection />
        <MethodStepsSection />
        <TrustRibbonSection />
        <WhyWoetiveSection />
        <TestimonialsSection />
        <FoundersSection />
        <ContactSection />
        <FooterSection />

        {/* Camera + state interpolation runs every frame */}
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
