import { SceneText, SceneMono, FONT_SERIF } from '../SceneText';
import { copy } from '../../scene/copy';

export function ContactSection() {
  const z = -112.5;
  const x = -2.35;
  return (
    <group>
      <SceneMono position={[x, 1.25, z]} fontSize={0.075} color="#9A9A92">
        {copy.contact.eyebrow}
      </SceneMono>

      {/* "Your turn." with lime underline under "turn" */}
      <SceneText position={[x, 0.55, z]} font={FONT_SERIF} italic fontSize={0.85} color="#F4F3EE" letterSpacing={-0.02} lineHeight={1.0}>
        {copy.contact.headlineLines[0]}
      </SceneText>
      <SceneText position={[x + 0.95, 0.55, z]} font={FONT_SERIF} italic fontSize={0.88} color="#F4F3EE" letterSpacing={-0.02}>
        {copy.contact.headlineLines[1]}
      </SceneText>
      <mesh position={[x + 1.20, 0.20, z + 0.001]}>
        <planeGeometry args={[0.65, 0.05]} />
        <meshBasicMaterial color="#D0EF00" />
      </mesh>

      <SceneText position={[x, -0.55, z]} fontSize={0.10} color="#F4F3EE" maxWidth={3.4} letterSpacing={-0.005}>
        {copy.contact.body}
      </SceneText>
    </group>
  );
}
