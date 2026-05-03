import { SceneText, SceneMono } from '../SceneText';
import { copy } from '../../scene/copy';

export function FooterSection() {
  const z = -124.5;
  return (
    <group>
      <SceneText position={[0, 0.45, z]} fontSize={1.4} color="#F4F3EE" letterSpacing={-0.04} anchorX="center">
        {copy.footer.mark}
      </SceneText>
      <SceneMono position={[0, -0.40, z]} fontSize={0.058} color="#9A9A92" letterSpacing={0.16} anchorX="center">
        {copy.footer.tagline}
      </SceneMono>
      <SceneMono position={[0, -0.85, z]} fontSize={0.045} color="#9A9A92" anchorX="center" maxWidth={6}>
        {copy.footer.meta}
      </SceneMono>
      {/* Socials */}
      {copy.footer.socials.map((s, i) => (
        <SceneMono key={s.label} position={[(i - 1) * 0.35, -1.35, z]} fontSize={0.06} color="#F4F3EE" anchorX="center">
          {s.label}
        </SceneMono>
      ))}
    </group>
  );
}
