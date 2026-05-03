import { SceneText, SceneMono } from '../SceneText';
import { WorkCard } from '../SceneCard';
import { copy } from '../../scene/copy';

export function WorkSection() {
  const z = -30.5;
  const x = -2.75;
  return (
    <group>
      {/* Off-white wall plane behind */}
      <mesh position={[0, 0, -32]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color="#F4F3EE" roughness={0.95} />
      </mesh>

      <SceneMono position={[x, 1.85, z]} fontSize={0.075} color="#5C5C57">
        {copy.work.eyebrow}
      </SceneMono>
      <SceneText position={[x, 1.25, z]} fontSize={0.46} color="#0B0B0A" letterSpacing={-0.03}>
        {copy.work.heading}
      </SceneText>
      <SceneText position={[x, 0.65, z]} fontSize={0.10} color="#5C5C57" maxWidth={3.4} letterSpacing={-0.005}>
        {copy.work.sub}
      </SceneText>

      {/* 3 cards in a row in front of wall */}
      <WorkCard
        position={[-1.55, -0.45, -29.9]}
        rotation={[0, 0.03, 0]}
        {...copy.work.cards[0]}
      />
      <WorkCard
        position={[ 0.05, -0.45, -30.15]}
        {...copy.work.cards[1]}
      />
      <WorkCard
        position={[ 1.65, -0.45, -30.4]}
        rotation={[0, -0.03, 0]}
        {...copy.work.cards[2]}
      />

      <SceneMono position={[x, -1.55, z]} fontSize={0.06} color="#0B0B0A">
        {copy.work.archive}
      </SceneMono>
    </group>
  );
}
