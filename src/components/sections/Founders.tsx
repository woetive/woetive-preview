import { SceneText, SceneMono } from '../SceneText';
import { FounderCard } from '../SceneCard';
import { copy } from '../../scene/copy';

export function FoundersSection() {
  return (
    <group>
      <mesh position={[0, 0, -104]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color="#F4F3EE" roughness={0.95} />
      </mesh>
      <SceneMono position={[-2.55, 1.45, -100.2]} fontSize={0.075} color="#5C5C57">
        {copy.founders.eyebrow}
      </SceneMono>
      <SceneText position={[-2.55, 0.95, -100.2]} fontSize={0.42} color="#0B0B0A" letterSpacing={-0.03}>
        {copy.founders.heading}
      </SceneText>
      <SceneText position={[-2.55, 0.20, -100.2]} fontSize={0.085} color="#5C5C57" maxWidth={3.5} letterSpacing={-0.005} lineHeight={1.4}>
        {copy.founders.lead}
      </SceneText>
      <SceneMono position={[-2.55, -1.45, -100.2]} fontSize={0.04} color="#5C5C57" maxWidth={4.5}>
        {copy.founders.meta}
      </SceneMono>

      <FounderCard position={[ 0.35, -0.75, -100.8]} {...copy.founders.cards[0]} />
      <FounderCard position={[ 1.55, -0.75, -101.2]} {...copy.founders.cards[1]} />
    </group>
  );
}
