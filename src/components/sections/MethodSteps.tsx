import { useEffect, useRef } from 'react';
import { copy } from '../../scene/copy';

export function MethodStepsSection() {
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
    <section className="sec sec--method sec--light" id="method" ref={root}>
      <div className="sec__inner">
        <header className="sec__header" data-reveal>
          <span className="eyebrow">{copy.method.eyebrow}</span>
          <h2 className="sec__heading">{copy.method.heading}</h2>
        </header>
        <ol className="method-steps">
          {copy.method.steps.map((s) => (
            <li data-reveal key={s.num}>
              <span className="step__num">{s.num}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
