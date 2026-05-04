import { useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { WebGLWorld } from './components/WebGLWorld';
import { HeroOverlay } from './components/HeroOverlay';
import { ManifestoSection } from './components/sections/Manifesto';
import { CloseupSection } from './components/sections/Closeup';
import { WorkSection } from './components/sections/Work';
import { MethodInterludeSection } from './components/sections/MethodInterlude';
import { MethodStepsSection } from './components/sections/MethodSteps';
import { TrustRibbonSection } from './components/sections/TrustRibbon';
import { WhyWoetiveSection } from './components/sections/WhyWoetive';
import { TestimonialsSection } from './components/sections/Testimonials';
import { FoundersSection } from './components/sections/Founders';
import { ContactSection } from './components/sections/Contact';
import { FooterSection } from './components/sections/Footer';
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

  // Scrolled-state for nav (subtle bg shift)
  useEffect(() => {
    const onScroll = () => {
      const nav = document.querySelector('.nav');
      if (!nav) return;
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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

      {/* HeroOverlay = HTML glass card + scroll bar fixed in viewport */}
      <HeroOverlay scrollRef={scrollRef} />

      <main id="main">
        {/* Hero is the 3D scene — its HTML counterpart is just a 100vh spacer
            so the canvas behind has full viewport while the user reads it. */}
        <section className="sec sec--hero" id="hero" aria-label="Woetive — Brands for companies that outgrew their first one." />

        <ManifestoSection />
        <CloseupSection />
        <WorkSection />
        <MethodInterludeSection />
        <MethodStepsSection />
        <TrustRibbonSection />
        <WhyWoetiveSection />
        <TestimonialsSection />
        <FoundersSection />
        <ContactSection />
      </main>

      <FooterSection />

      {booting && (
        <div className="boot" aria-hidden="true">
          <div className="boot__bar"><div className="boot__fill" /></div>
          <span className="boot__label">Loading</span>
        </div>
      )}
    </>
  );
}
