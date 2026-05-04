import { useEffect, useRef } from 'react';
import { copy } from '../../scene/copy';

export function CloseupSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current) return;
    const items = root.current.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="sec sec--interlude sec--dark" id="closeup" ref={root}>
      <span className="eyebrow eye--top-left" data-reveal>{copy.closeup.eyebrow}</span>
      <span className="eyebrow eye--bottom-right" data-reveal>{copy.closeup.line}</span>
    </section>
  );
}
