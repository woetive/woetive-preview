import { SceneMono } from '../SceneText';
import { copy } from '../../scene/copy';

export function MethodInterludeSection() {
  return (
    <group>
      <SceneMono position={[1.9, 1.45, -43.6]} fontSize={0.075} color="#9A9A92">
        {copy.methodInterlude.eyebrow}
      </SceneMono>
      <SceneMono position={[-2.2, -1.15, -43.8]} fontSize={0.10} color="#F4F3EE" letterSpacing={0.06} maxWidth={3.0}>
        {copy.methodInterlude.line}
      </SceneMono>
    </group>
  );
}
