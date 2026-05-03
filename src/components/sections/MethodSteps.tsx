import { SceneText, SceneMono } from '../SceneText';
import { MethodStep } from '../SceneCard';
import { copy } from '../../scene/copy';

export function MethodStepsSection() {
  return (
    <group>
      {/* Light room plane */}
      <mesh position={[0, 0, -57]}>
        <planeGeometry args={[20, 14]} />
        <meshStandardMaterial color="#F4F3EE" roughness={0.95} />
      </mesh>

      <SceneMono position={[-2.65, 1.85, -52.5]} fontSize={0.075} color="#5C5C57">
        {copy.method.eyebrow}
      </SceneMono>
      <SceneText position={[-2.65, 1.25, -52.5]} fontSize={0.46} color="#0B0B0A" letterSpacing={-0.03}>
        {copy.method.heading}
      </SceneText>

      {/* Steps arranged in depth — camera passes diagonally */}
      <MethodStep position={[-1.65,  0.55, -53.0]} rotation={[0, 0.03, 0]}  {...copy.method.steps[0]} />
      <MethodStep position={[-0.85,  0.10, -55.2]} rotation={[0, 0.02, 0]}  {...copy.method.steps[1]} />
      <MethodStep position={[-0.05, -0.35, -57.4]} rotation={[0, 0.01, 0]}  {...copy.method.steps[2]} />
      <MethodStep position={[ 0.75, -0.80, -59.6]}                          {...copy.method.steps[3]} />
    </group>
  );
}
