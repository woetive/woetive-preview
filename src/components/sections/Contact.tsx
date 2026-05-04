import { useEffect, useRef } from 'react';
import { copy } from '../../scene/copy';

export function ContactSection() {
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
    }, { threshold: 0.3 });
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="sec sec--contact sec--dark" id="contact" ref={root}>
      <div className="sec__inner">
        <span className="eyebrow" data-reveal>{copy.contact.eyebrow}</span>
        <h2 className="contact__headline" data-reveal>
          {copy.contact.headlineLines[0]}{' '}
          <em className="lime">{copy.contact.limeWord}</em>.
        </h2>
        <p className="contact__line" data-reveal>{copy.contact.body}</p>
        <div className="contact__cta" data-reveal>
          <a href={copy.contact.mailto} className="btn btn--accent btn--large">{copy.contact.ctaPrimary}</a>
          <a href="#work" className="btn btn--ghost">{copy.contact.ctaSecondary}</a>
        </div>
      </div>
    </section>
  );
}
