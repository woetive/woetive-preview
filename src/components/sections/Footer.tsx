import { copy } from '../../scene/copy';

export function FooterSection() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="footer__mark">{copy.footer.mark}</span>
          <span className="footer__tagline">{copy.footer.tagline}</span>
        </div>
        <div className="footer__meta">
          {copy.footer.meta.split(' · ').map((part, i, arr) => (
            <span key={i}>
              {part}{i < arr.length - 1 && <span aria-hidden="true"> · </span>}
            </span>
          ))}
        </div>
        <div className="footer__social">
          {copy.footer.socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
