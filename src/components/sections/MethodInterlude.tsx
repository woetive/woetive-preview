import { useEffect, useRef } from 'react';
import { copy } from '../../scene/copy';

export function MethodInterludeSection() {
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
    <section className="sec sec--interlude sec--dark" id="method-interlude" ref={root}>
      <span className="eyebrow eye--top-right" data-reveal>{copy.methodInterlude.eyebrow}</span>
      <span className="eyebrow eye--bottom-left" data-reveal>{copy.methodInterlude.line}</span>
    </section>
  );
}
