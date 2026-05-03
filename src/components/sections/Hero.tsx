import { SceneText, SceneMono, FONT_SERIF } from '../SceneText';
import { copy } from '../../scene/copy';

// Hero zone — z 0 to -10. Headline left, humanoid right (handled by CameraRig).
// Glass card + scroll cue + nav are HTML overlays (not in WebGL).
export function HeroSection() {
  const z = -1.15;
  const headlineX = -2.55;
  const headlineY = 1.40;
  const lineGap = 0.55;

  return (
    <group>
      {/* Eyebrows */}
      <SceneMono position={[headlineX, 2.45, z]} fontSize={0.075} color="#9A9A92">
        {copy.hero.eyebrowLeft}
      </SceneMono>

      {/* Headline 4 lines */}
      {copy.hero.headlineLines.map((line, i) => {
        const y = headlineY - i * lineGap;
        const isLimeLine = line.includes(copy.hero.limeWord);
        if (isLimeLine) {
          // Render as two segments around the lime word
          const before = line.split(copy.hero.limeWord)[0];
          const after = line.split(copy.hero.limeWord)[1];
          return (
            <group key={i} position={[0, 0, 0]}>
              <SceneText position={[headlineX, y, z]} fontSize={0.55} color="#F4F3EE" letterSpacing={-0.04} lineHeight={1.0}>
                {before}
              </SceneText>
              {/* Italic serif lime word */}
              <SceneText position={[headlineX + before.length * 0.20, y, z]} fontSize={0.58} color="#F4F3EE" italic font={FONT_SERIF} letterSpacing={-0.02}>
                {copy.hero.limeWord}
              </SceneText>
              {/* Lime underline below the word */}
              <mesh position={[headlineX + before.length * 0.20 + (copy.hero.limeWord.length * 0.18) / 2, y - 0.30, z + 0.001]}>
                <planeGeometry args={[copy.hero.limeWord.length * 0.18, 0.045]} />
                <meshBasicMaterial color="#D0EF00" />
              </mesh>
              <SceneText position={[headlineX + before.length * 0.20 + copy.hero.limeWord.length * 0.20, y, z]} fontSize={0.55} color="#F4F3EE" letterSpacing={-0.04}>
                {after}
              </SceneText>
            </group>
          );
        }
        return (
          <SceneText key={i} position={[headlineX, y, z]} fontSize={0.55} color="#F4F3EE" letterSpacing={-0.04} lineHeight={1.0}>
            {line}
          </SceneText>
        );
      })}

      {/* Editorial note bottom-left */}
      <SceneMono position={[headlineX, -1.30, z]} fontSize={0.052} color="#9A9A92" maxWidth={3.4} lineHeight={1.5} letterSpacing={0.02}>
        {copy.hero.editorial}
      </SceneMono>
    </group>
  );
}
