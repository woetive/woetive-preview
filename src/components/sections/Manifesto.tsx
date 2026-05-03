import { SceneText, SceneMono, FONT_SERIF } from '../SceneText';
import { copy } from '../../scene/copy';

// Manifesto zone — z -10 to -20. Italic serif headline left, body below.
export function ManifestoSection() {
  const z = -10.95;
  const x = -2.35;

  return (
    <group>
      <SceneMono position={[x, 2.30, z]} fontSize={0.075} color="#9A9A92">
        {copy.manifesto.eyebrow}
      </SceneMono>

      {copy.manifesto.headlineLines.map((line, i) => {
        const y = 1.50 - i * 0.65;
        const isLime = line.includes(copy.manifesto.limeWord);
        if (isLime) {
          const before = line.split(copy.manifesto.limeWord)[0];
          return (
            <group key={i}>
              <SceneText position={[x, y, z]} font={FONT_SERIF} italic fontSize={0.78} color="#F4F3EE" letterSpacing={-0.02} lineHeight={1.0}>
                {before}
              </SceneText>
              <SceneText position={[x + before.length * 0.30, y, z]} font={FONT_SERIF} italic fontSize={0.80} color="#F4F3EE" letterSpacing={-0.02}>
                {copy.manifesto.limeWord}
              </SceneText>
              <mesh position={[x + before.length * 0.30 + (copy.manifesto.limeWord.length * 0.32) / 2, y - 0.34, z + 0.001]}>
                <planeGeometry args={[copy.manifesto.limeWord.length * 0.32, 0.05]} />
                <meshBasicMaterial color="#D0EF00" />
              </mesh>
            </group>
          );
        }
        return (
          <SceneText key={i} position={[x, y, z]} font={FONT_SERIF} italic fontSize={0.78} color="#F4F3EE" letterSpacing={-0.02} lineHeight={1.0}>
            {line}
          </SceneText>
        );
      })}

      <SceneText position={[x, -0.55, z]} fontSize={0.10} color="#F4F3EE" maxWidth={3.4} letterSpacing={-0.005} lineHeight={1.4}>
        {copy.manifesto.body}
      </SceneText>

      <SceneMono position={[x, -1.55, z]} fontSize={0.045} color="#9A9A92" maxWidth={4.0}>
        {copy.manifesto.meta}
      </SceneMono>
    </group>
  );
}
