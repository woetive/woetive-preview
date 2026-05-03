import { SceneText, SceneMono } from '../SceneText';
import { WhyCard } from '../SceneCard';
import { copy } from '../../scene/copy';

export function WhyWoetiveSection() {
  return (
    <group>
      <mesh position={[0, 0, -80]}>
        <planeGeometry args={[24, 14]} />
        <meshStandardMaterial color="#F4F3EE" roughness={0.95} />
      </mesh>
      <SceneMono position={[-2.65, 1.95, -74]} fontSize={0.075} color="#5C5C57">
        {copy.why.eyebrow}
      </SceneMono>
      <SceneText position={[-2.65, 1.35, -74]} fontSize={0.46} color="#0B0B0A" maxWidth={5.5} letterSpacing={-0.03}>
        {copy.why.heading}
      </SceneText>

      {/* Bento panels staggered in depth */}
      <WhyCard position={[-1.75,  0.45, -75.0]} scale={[1.45, 1.0, 1]}  {...copy.why.cards[0]} />
      <WhyCard position={[ 0.00,  0.55, -75.7]} scale={[1.15, 0.75, 1]} {...copy.why.cards[1]} />
      <WhyCard position={[ 1.45,  0.25, -76.2]} scale={[1.05, 1.25, 1]} {...copy.why.cards[2]} />
      <WhyCard position={[ 0.05, -0.75, -77.0]} scale={[1.15, 1.05, 1]} {...copy.why.cards[3]} />
      <WhyCard position={[-1.55, -0.85, -77.6]} scale={[1.45, 0.85, 1]} {...copy.why.cards[4]} />
      <WhyCard position={[ 1.45, -0.95, -78.2]} scale={[1.05, 0.85, 1]} {...copy.why.cards[5]} />
    </group>
  );
}
