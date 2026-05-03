import { SceneMono } from '../SceneText';
import { copy } from '../../scene/copy';

export function CloseupSection() {
  return (
    <group>
      <SceneMono position={[-2.4, 1.55, -20.8]} fontSize={0.075} color="#9A9A92">
        {copy.closeup.eyebrow}
      </SceneMono>
      <SceneMono position={[1.25, -1.35, -20.6]} rotation={[0, -0.04, 0]} fontSize={0.10} color="#F4F3EE" letterSpacing={0.06} maxWidth={3.0}>
        {copy.closeup.line}
      </SceneMono>
    </group>
  );
}
