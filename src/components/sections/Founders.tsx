import { useEffect, useRef } from 'react';
import { copy } from '../../scene/copy';

export function FoundersSection() {
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
    }, { threshold: 0.2 });
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="sec sec--founders sec--light" id="founders" ref={root}>
      <div className="sec__inner">
        <header className="sec__header" data-reveal>
          <span className="eyebrow">{copy.founders.eyebrow}</span>
          <h2 className="sec__heading">{copy.founders.heading}</h2>
          <p className="founders__lead">{copy.founders.lead}</p>
          <div className="founders__meta">{copy.founders.meta}</div>
        </header>
        <div className="founders__grid">
          {copy.founders.cards.map((c) => {
            const initials = c.id.split(' / ')[0];
            return (
              <article className="founder-card" data-reveal key={c.id}>
                <span className="founder-card__id">{c.id}</span>
                <div className="founder-card__portrait" aria-hidden="true">
                  <span className="founder-card__initials">{initials}</span>
                </div>
                <h3 className="founder-card__name">{c.name}</h3>
                <span className="founder-card__role">{c.role}</span>
                <p className="founder-card__bio">{c.bio}</p>
                <ul className="founder-card__tags">
                  {c.tags.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
