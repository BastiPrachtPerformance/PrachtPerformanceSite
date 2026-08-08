import type { ReactNode } from "react";

export function Brand() {
  return <a className="brand" href="/" aria-label="Pracht Performance – Startseite"><img src="/logo.png" alt="Pracht Performance" /></a>;
}

export function SiteHeader({ light = false }: { light?: boolean }) {
  return <header className={`site-header container ${light ? "is-light" : ""}`}>
    <Brand />
    <nav aria-label="Hauptnavigation">
      <a href="/leistungen">Leistungen</a>
      <a href="/ansatz">Ansatz</a>
      <a href="/referenzen">Referenzen</a>
      <a href="/kontakt">Kontakt</a>
    </nav>
    <a className="header-cta" href="/kontakt">Projekt anfragen <span>↗</span></a>
  </header>;
}

export function SiteFooter() {
  return <footer className="footer container"><Brand /><p>© {new Date().getFullYear()} Pracht Performance</p><div><a href="/impressum">Impressum</a><a href="/datenschutz">Datenschutz</a></div></footer>;
}

export function PageIntro({ eyebrow, title, copy, children }: { eyebrow: string; title: ReactNode; copy: string; children?: ReactNode }) {
  return <section className="sub-hero"><SiteHeader /><div className="container sub-hero-layout"><p className="sub-hero-index">P/ — {eyebrow}</p><h1>{title}</h1><div className="sub-hero-tag" aria-hidden="true"><span>P/</span><i /></div><div className="sub-hero-copy"><p>{copy}</p>{children}</div></div></section>;
}

export function ContactBand() {
  return <section className="closing-band"><div className="container"><p className="section-kicker">Kontakt</p><h2>Ein gutes Projekt<br />beginnt mit <em>einem Gespräch.</em></h2><a className="mail-link" href="mailto:info@pracht-performance.de">info@pracht-performance.de <span>↗</span></a></div></section>;
}
