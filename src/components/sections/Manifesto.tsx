import { useEffect, useRef } from 'react';
import { copy } from '../../scene/copy';

export function ManifestoSection() {
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
    }, { threshold: 0.25 });
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const lime = copy.manifesto.limeWord;

  return (
    <section className="sec sec--manifesto sec--dark" id="manifesto" ref={root}>
      <div className="sec__inner">
        <span className="eyebrow" data-reveal>{copy.manifesto.eyebrow}</span>
        <h2 className="manifesto__headline">
          {copy.manifesto.headlineLines.map((line, i) => {
            if (line.includes(lime)) {
              const before = line.split(lime)[0];
              const after  = line.split(lime)[1];
              return (
                <span key={i} data-reveal>
                  {before}
                  <em className="lime">{lime}</em>
                  {after}
                </span>
              );
            }
            return <span key={i} data-reveal>{line}</span>;
          })}
        </h2>
        <p className="manifesto__body" data-reveal>{copy.manifesto.body}</p>
        <div className="manifesto__meta" data-reveal>{copy.manifesto.meta}</div>
      </div>
    </section>
  );
}
