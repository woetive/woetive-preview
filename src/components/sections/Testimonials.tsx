import { useEffect, useRef } from 'react';
import { copy } from '../../scene/copy';

export function TestimonialsSection() {
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
    <section className="sec sec--testimonials sec--light" id="testimonials" ref={root}>
      <div className="sec__inner">
        <header className="sec__header" data-reveal>
          <span className="eyebrow">{copy.testimonials.eyebrow}</span>
          <h2 className="sec__heading">{copy.testimonials.heading}</h2>
        </header>
        <div className="testimonials__grid">
          {copy.testimonials.quotes.map((q) => (
            <article className="testimonial-card" data-reveal key={q.initials}>
              <p className="testimonial-card__quote">{q.quote}</p>
              <div className="testimonial-card__divider" aria-hidden="true" />
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">{q.initials}</div>
                <div className="testimonial-card__meta">
                  <span className="testimonial-card__name">{q.name}</span>
                  <span className="testimonial-card__role">{q.role}</span>
                  <span className="testimonial-card__rating" aria-label="5 out of 5 stars">★★★★★</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
