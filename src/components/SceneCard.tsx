import { SceneText, SceneMono } from './SceneText';

type WorkCardProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  title: string;
  tag: string;
  meta: string;
  brief: string;
  stats: string;
  category: string;
  dark?: boolean;          // dark surface vs light
};

export function WorkCard({
  position, rotation = [0, 0, 0],
  title, tag, meta, brief, stats, category, dark = true,
}: WorkCardProps) {
  const surface = dark ? '#0A0A09' : '#F4F3EE';
  const ink     = dark ? '#F4F3EE' : '#0B0B0A';
  const inkSoft = dark ? '#9A9A92' : '#5C5C57';
  return (
    <group position={position} rotation={rotation}>
      {/* Card body */}
      <mesh>
        <planeGeometry args={[1.4, 1.85]} />
        <meshStandardMaterial color={surface} roughness={0.85} metalness={0} />
      </mesh>
      {/* Top media area */}
      <mesh position={[0, 0.35, 0.001]}>
        <planeGeometry args={[1.34, 0.95]} />
        <meshStandardMaterial color={dark ? '#141413' : '#0A0A09'} roughness={0.9} />
      </mesh>
      {/* Lime line down chest of media */}
      <mesh position={[0, 0.35, 0.002]}>
        <planeGeometry args={[0.008, 0.55]} />
        <meshStandardMaterial color="#D0EF00" emissive="#D0EF00" emissiveIntensity={0.9} />
      </mesh>
      {/* Tag mono */}
      <SceneMono position={[-0.6, 0.78, 0.003]} fontSize={0.04} color={inkSoft} maxWidth={1.3}>
        {tag}
      </SceneMono>
      {/* Meta */}
      <SceneMono position={[-0.65, -0.20, 0.003]} fontSize={0.038} color={inkSoft} maxWidth={1.3}>
        {meta}
      </SceneMono>
      {/* Title */}
      <SceneText position={[-0.65, -0.36, 0.003]} fontSize={0.16} color={ink} maxWidth={1.3} letterSpacing={-0.03}>
        {title}
      </SceneText>
      {/* Brief */}
      <SceneText position={[-0.65, -0.55, 0.003]} fontSize={0.06} color={ink} maxWidth={1.25} letterSpacing={-0.01} lineHeight={1.3}>
        {brief}
      </SceneText>
      {/* Stats */}
      <SceneMono position={[-0.65, -0.74, 0.003]} fontSize={0.034} color={inkSoft} maxWidth={1.3} lineHeight={1.4}>
        {stats}
      </SceneMono>
      {/* Category */}
      <SceneMono position={[-0.65, -0.86, 0.003]} fontSize={0.034} color={inkSoft} maxWidth={1.3}>
        {category}
      </SceneMono>
    </group>
  );
}

type WhyCardProps = {
  position: [number, number, number];
  scale?: [number, number, number];
  num: string;
  title: string;
  body: string;
};

export function WhyCard({ position, scale = [1, 1, 1], num, title, body }: WhyCardProps) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        <planeGeometry args={[1.4, 1.0]} />
        <meshStandardMaterial color="#FAF9F4" roughness={0.95} />
      </mesh>
      <SceneMono position={[-0.6, 0.36, 0.001]} fontSize={0.038} color="#5C5C57" maxWidth={1.3}>
        {num}
      </SceneMono>
      <SceneText position={[-0.6, 0.18, 0.001]} fontSize={0.10} color="#0B0B0A" maxWidth={1.3} letterSpacing={-0.02}>
        {title}
      </SceneText>
      <SceneText position={[-0.6, -0.12, 0.001]} fontSize={0.05} color="#5C5C57" maxWidth={1.25} letterSpacing={-0.005} lineHeight={1.35}>
        {body}
      </SceneText>
    </group>
  );
}

type FounderCardProps = {
  position: [number, number, number];
  id: string;
  name: string;
  role: string;
  bio: string;
};

export function FounderCard({ position, id, name, role, bio }: FounderCardProps) {
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[1.05, 1.4]} />
        <meshStandardMaterial color="#FAF9F4" roughness={0.95} />
      </mesh>
      <SceneMono position={[-0.45, 0.55, 0.001]} fontSize={0.034} color="#5C5C57">
        {id}
      </SceneMono>
      {/* Portrait placeholder */}
      <mesh position={[0, 0.20, 0.001]}>
        <planeGeometry args={[0.95, 0.50]} />
        <meshStandardMaterial color="#0B0B0A" />
      </mesh>
      <SceneText position={[0, 0.20, 0.002]} fontSize={0.18} color="#D0EF00" anchorX="center" anchorY="middle" letterSpacing={-0.04}>
        {id.split(' / ')[0]}
      </SceneText>
      <SceneText position={[-0.45, -0.18, 0.001]} fontSize={0.066} color="#0B0B0A" maxWidth={0.95} letterSpacing={-0.02}>
        {name}
      </SceneText>
      <SceneMono position={[-0.45, -0.30, 0.001]} fontSize={0.032} color="#5C5C57">
        {role}
      </SceneMono>
      <SceneText position={[-0.45, -0.50, 0.001]} fontSize={0.040} color="#5C5C57" maxWidth={0.95} letterSpacing={-0.005} lineHeight={1.4}>
        {bio}
      </SceneText>
    </group>
  );
}

type TestimonialCardProps = {
  position: [number, number, number];
  quote: string;
  initials: string;
  name: string;
  role: string;
};

export function TestimonialCard({ position, quote, initials, name, role }: TestimonialCardProps) {
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[1.5, 1.7]} />
        <meshStandardMaterial color="#FAF9F4" roughness={0.95} />
      </mesh>
      <SceneText position={[-0.65, 0.35, 0.001]} italic fontSize={0.075} color="#0B0B0A" maxWidth={1.4} letterSpacing={-0.005} lineHeight={1.35}>
        {quote}
      </SceneText>
      {/* divider */}
      <mesh position={[0, -0.40, 0.001]}>
        <planeGeometry args={[1.4, 0.005]} />
        <meshBasicMaterial color="#0B0B0A" transparent opacity={0.10} />
      </mesh>
      {/* Avatar */}
      <mesh position={[-0.55, -0.65, 0.001]}>
        <circleGeometry args={[0.10, 32]} />
        <meshStandardMaterial color="#FAF9F4" />
      </mesh>
      <SceneMono position={[-0.55, -0.65, 0.002]} fontSize={0.044} color="#0B0B0A" anchorX="center" anchorY="middle">
        {initials}
      </SceneMono>
      <SceneText position={[-0.40, -0.58, 0.001]} fontSize={0.044} color="#0B0B0A" maxWidth={1.0} letterSpacing={-0.01}>
        {name}
      </SceneText>
      <SceneMono position={[-0.40, -0.70, 0.001]} fontSize={0.030} color="#5C5C57" maxWidth={1.0}>
        {role}
      </SceneMono>
    </group>
  );
}

type MethodStepProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  num: string;
  title: string;
  body: string;
};

export function MethodStep({ position, rotation = [0, 0, 0], num, title, body }: MethodStepProps) {
  return (
    <group position={position} rotation={rotation}>
      <SceneMono position={[-1.0, 0.18, 0.001]} fontSize={0.060} color="#D0EF00" letterSpacing={0.10}>
        {num}
      </SceneMono>
      <SceneText position={[-1.0, 0.04, 0.001]} fontSize={0.16} color="#0B0B0A" maxWidth={2.0} letterSpacing={-0.03}>
        {title}
      </SceneText>
      <SceneText position={[-1.0, -0.22, 0.001]} fontSize={0.07} color="#5C5C57" maxWidth={2.0} letterSpacing={-0.01} lineHeight={1.35}>
        {body}
      </SceneText>
    </group>
  );
}
