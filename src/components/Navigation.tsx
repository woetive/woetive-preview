import { copy } from '../scene/copy';

export function Navigation() {
  return (
    <header className="nav" role="banner">
      <a href="#" className="nav__brand" aria-label="Woetive — Home">
        <span className="nav__mark">{copy.nav.mark}</span>
        <span className="nav__sep" aria-hidden="true" />
        <span className="nav__tag">
          {copy.nav.tagline.split('\n').map((l, i) => (
            <span key={i}>{l}{i === 0 && <br/>}</span>
          ))}
        </span>
      </a>
      <nav className="nav__menu" aria-label="Primary">
        {copy.nav.menu.map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`}>{item.toUpperCase()}</a>
        ))}
      </nav>
      <div className="nav__status">
        {copy.nav.status.split(' · ').map((part, i, arr) => (
          <span key={i}>
            {part}{i < arr.length - 1 && <span aria-hidden="true"> · </span>}
          </span>
        ))}
      </div>
    </header>
  );
}
