import { copy } from '../../scene/copy';

export function TrustRibbonSection() {
  // Repeat the items twice for a seamless loop
  const items = copy.trust.items;
  return (
    <section className="sec sec--trust sec--light" id="trust">
      <span className="eyebrow trust__eyebrow">{copy.trust.eyebrow}</span>
      <div className="marquee" aria-hidden="false">
        <div className="marquee__track">
          {[...items, ...items].map((it, i) => (
            <span key={i}>
              <span className="marquee__item">{it}</span>
              <span className="marquee__sep">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
