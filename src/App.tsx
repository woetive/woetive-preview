import { useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { WebGLWorld } from './components/WebGLWorld';
import { HeroOverlay } from './components/HeroOverlay';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useMouseAttention } from './hooks/useMouseAttention';

export default function App() {
  const scrollRef = useScrollProgress();
  const cursor = useMouseAttention();
  const [booting, setBooting] = useState(true);

  // Lenis smooth scroll
  useEffect(() => {
    let lenis: any;
    let raf = 0;
    (async () => {
      const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMobile = matchMedia('(max-width: 767px)').matches;
      if (reduceMotion || isMobile) return;
      const Lenis = (await import('lenis')).default;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      const tick = (time: number) => { lenis.raf(time); raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    })();
    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, []);

  // Boot loader fade
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 4200);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div className="world-canvas">
        <WebGLWorld scrollRef={scrollRef} cursor={cursor} />
      </div>

      <div className="frame-border" aria-hidden="true" />

      <Navigation />

      <HeroOverlay scrollRef={scrollRef} />

      <div className="scroll-spacer" aria-hidden="true" />

      {booting && (
        <div className="boot" aria-hidden="true">
          <div className="boot__bar"><div className="boot__fill" /></div>
          <span className="boot__label">Loading</span>
        </div>
      )}
    </>
  );
}
