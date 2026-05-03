import { SceneText, SceneMono } from '../SceneText';
import { TestimonialCard } from '../SceneCard';
import { copy } from '../../scene/copy';

export function TestimonialsSection() {
  return (
    <group>
      <mesh position={[0, 0, -93]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color="#FAF9F4" roughness={0.95} />
      </mesh>
      <SceneMono position={[-2.55, 1.55, -90]} fontSize={0.075} color="#5C5C57">
        {copy.testimonials.eyebrow}
      </SceneMono>
      <SceneText position={[-2.55, 1.0, -90]} fontSize={0.40} color="#0B0B0A" letterSpacing={-0.03}>
        {copy.testimonials.heading}
      </SceneText>

      <TestimonialCard position={[-1.65, -0.15, -91.0]} {...copy.testimonials.quotes[0]} />
      <TestimonialCard position={[ 0.00, -0.15, -91.4]} {...copy.testimonials.quotes[1]} />
      <TestimonialCard position={[ 1.65, -0.15, -91.8]} {...copy.testimonials.quotes[2]} />
    </group>
  );
}
