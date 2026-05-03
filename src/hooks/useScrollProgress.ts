import { useEffect, useRef } from 'react';

// Returns a ref whose .current is the current global scroll progress 0..1.
// Reads the natural document scroll (Lenis updates window.scrollY for us).
export function useScrollProgress() {
  const ref = useRef(0);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      ref.current = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return ref;
}
