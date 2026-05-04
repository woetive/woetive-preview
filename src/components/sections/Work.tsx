import { useEffect, useRef } from 'react';
import { copy } from '../../scene/copy';

const cardTones = ['charcoal', 'black', 'ink'];

export function WorkSection() {
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
    <section className="sec sec--work sec--light" id="work" ref={root}>
      <div className="sec__inner">
        <header className="sec__header" data-reveal>
          <span className="eyebrow">{copy.work.eyebrow}</span>
          <h2 className="sec__heading">{copy.work.heading}</h2>
          <p className="sec__lead">{copy.work.sub}</p>
        </header>

        <ol className="work-cards">
          {copy.work.cards.map((c, i) => (
            <li className="work-card" data-reveal key={c.title}>
              <div className={`work-card__media work-card__media--${cardTones[i]}`}>
                <span className="work-card__mono">{`0${i + 1} / ${c.tag}`}</span>
                <span className="work-card__limeline" aria-hidden="true" />
              </div>
              <div className="work-card__body">
                <span className="work-card__meta">{c.meta}</span>
                <h3 className="work-card__title">{c.title}</h3>
                <p className="work-card__brief">{c.brief}</p>
                <p className="work-card__stats">{c.stats}</p>
                <span className="work-card__tag">{c.category}</span>
              </div>
            </li>
          ))}
        </ol>

        <a href="#contact" className="archive-link" data-reveal>{copy.work.archive}</a>
      </div>
    </section>
  );
}
