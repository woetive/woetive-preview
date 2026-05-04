import { useEffect, useRef } from 'react';
import { copy } from '../../scene/copy';

export function WhyWoetiveSection() {
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
    }, { threshold: 0.15 });
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="sec sec--why sec--light" id="why" ref={root}>
      <div className="sec__inner">
        <header className="sec__header" data-reveal>
          <span className="eyebrow">{copy.why.eyebrow}</span>
          <h2 className="sec__heading">{copy.why.heading}</h2>
        </header>
        <div className="why-bento">
          {copy.why.cards.map((c, i) => (
            <article className={`why-card why-card--${String(i + 1).padStart(2, '0')}`} data-reveal key={c.num}>
              <span className="why-card__num">{c.num}</span>
              <h3 className="why-card__title">{c.title}</h3>
              <p className="why-card__copy">{c.body}</p>
              {c.tags && (
                <ul className="why-card__tags">
                  {c.tags.map((t) => <li key={t}>{t}</li>)}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
