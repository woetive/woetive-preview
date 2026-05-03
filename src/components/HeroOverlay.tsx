import { useEffect, useRef, useState } from 'react';
import { copy } from '../scene/copy';

// Glass card + scroll cue as HTML overlays. The glass card position is
// fixed in the bottom-right of the viewport and only visible while the
// user is in the Hero zone (scroll progress < 0.18 roughly).

type Props = { scrollRef: React.RefObject<number> };

export function HeroOverlay({ scrollRef }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const cueRef  = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = scrollRef.current ?? 0;
      // Fade glass + cue out as we leave the hero zone
      const heroFade = Math.max(0, Math.min(1, 1 - (p - 0.05) / 0.10));
      if (cardRef.current) {
        cardRef.current.style.opacity = String(heroFade);
        cardRef.current.style.transform = `translateY(${(1 - heroFade) * 24}px)`;
      }
      if (cueRef.current) {
        cueRef.current.style.opacity = String(Math.max(0, 1 - p * 4));
      }
      if (fillRef.current) {
        fillRef.current.style.width = `${(p * 100).toFixed(2)}%`;
      }
      setVisible(heroFade > 0.01);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scrollRef]);

  // Glass card mouse-tracked shimmer
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const onMove = (e: MouseEvent) => {
      const r = card.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--mx', `${mx}%`);
      card.style.setProperty('--my', `${my}%`);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <>
      <aside
        ref={cardRef}
        className="glass-card"
        style={{
          right: 'calc(var(--frame-inset) + 1.5rem)',
          bottom: 'calc(var(--frame-inset) + 1.5rem)',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <div className="glass-card__inner">
          <span className="glass-card__eye">{copy.hero.glass.eyebrow}</span>
          <p className="glass-card__copy">
            {copy.hero.glass.lines.map((l, i) => (
              <span key={i}>{l}{i < copy.hero.glass.lines.length - 1 && <br/>}</span>
            ))}
          </p>
          <div className="glass-card__foot">
            <span className="glass-card__icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1v14M1 8h14M3.4 3.4l9.2 9.2M12.6 3.4l-9.2 9.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </span>
            <a href={copy.contact.mailto} className="glass-card__cta">
              {copy.hero.glass.cta}
            </a>
          </div>
        </div>
      </aside>

      <div className="scroll-cue" ref={cueRef}>
        <span className="scroll-cue__label">{copy.hero.scrollCue}</span>
        <div className="scroll-cue__bar" aria-hidden="true">
          <div className="scroll-cue__fill" ref={fillRef} />
        </div>
      </div>
    </>
  );
}
