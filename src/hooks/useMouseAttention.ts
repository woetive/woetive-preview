import { useEffect, useRef } from 'react';

// Mouse position in viewport-normalized coords (-1..1 each axis).
// Updates on mousemove. Damping is the consumer's responsibility.
export function useMouseAttention() {
  const ref = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      ref.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ref.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return ref;
}
