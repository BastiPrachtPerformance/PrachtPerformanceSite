import { Brand, SiteFooter, SiteHeader } from "./components/SiteShell";

const clients = [
  ["ennovex", "Energieverwaltung"], ["PIECHA", "Automotive"], ["ZIZOU", "Fashion"],
  ["VHG", "Dirk Grosser"], ["urlaubduhnen.de", "MEERzeit"], ["Podologie", "Gesundheit"],
];

export default function Home() {
  return <main>
    <section className="hero" id="top"><div className="grain" aria-hidden="true" /><div className="orb orb-one" aria-hidden="true" /><div className="orb orb-two" aria-hidden="true" /><div className="particles" aria-hidden="true">{Array.from({ length: 22 }, (_, index) => <i key={index} />)}</div>
      <SiteHeader />
      <div className="hero-content container"><p className="eyebrow reveal">Strategie · Digital · Objektservice</p><h1 className="hero-title reveal delay-one">Wirkung beginnt<br />mit <em>klarer</em> Richtung.</h1><div className="hero-bottom reveal delay-two"><p>Wir machen Unternehmen sichtbar, strukturierter und bereit für ihren nächsten Schritt.</p><a className="round-link" href="/leistungen" aria-label="Leistungen entdecken"><span>Entdecken</span><b>↓</b></a></div></div>
      <div className="hero-footer container reveal delay-three"><p>Management, Marketing &amp; digitale Erlebnisse.</p><p>Seit 2018 · Bergkamen / überall</p></div>
    </section>
    <section className="intro section container"><p className="section-kicker">Pracht Performance</p><div className="intro-grid"><h2>Weniger Lärm.<br /><em>Mehr Relevanz.</em></h2><div><p className="intro-copy">Gute Arbeit muss nicht laut sein. Sie muss die richtigen Menschen erreichen, Prozesse vereinfachen und Marken ein Gesicht geben, das man nicht vergisst.</p><a className="text-link" href="/ansatz">So arbeiten wir <span>↗</span></a></div></div></section>
    <section className="clients section"><div className="container"><div className="section-head"><p className="section-kicker">Ausgewählte Kunden</p><p className="section-note">Partnerschaften, die auf Klarheit, Vertrauen und echter Zusammenarbeit beruhen.</p></div><div className="client-grid">{clients.map(([name, type]) => <article className="client-logo" key={name}><strong>{name}</strong><small>{type}</small></article>)}</div><a className="text-link clients-link" href="/referenzen">Alle Referenzen entdecken <span>↗</span></a></div></section>
    <section className="statement section container"><div className="statement-card"><p className="section-kicker">Unser Anspruch</p><blockquote>Aus Ideen<br />werden <em>Ergebnisse.</em></blockquote><p className="statement-copy">Keine Lösungen von der Stange. Wir verbinden unternehmerisches Denken mit Gestaltung, die sich richtig anfühlt – und richtig funktioniert.</p><div className="statement-mark" aria-hidden="true">P</div></div></section>
    <section className="home-services section"><div className="container"><p className="section-kicker">Was wir machen</p><div className="home-service-grid"><h2>Strategie, die<br /><em>in Bewegung bringt.</em></h2><div><p>Von der Positionierung bis zum digitalen Auftritt: Wir verbinden die Disziplinen, die Ihre Marke nach vorne bringen.</p><a className="round-link dark-round" href="/leistungen"><span>Leistungen</span><b>↗</b></a></div></div></div></section>
    <section className="contact"><div className="contact-orb" aria-hidden="true" /><div className="container contact-content"><p className="section-kicker">Kontakt</p><h2>Bereit für<br /><em>den nächsten Schritt?</em></h2><a className="mail-link" href="mailto:info@pracht-performance.de">info@pracht-performance.de <span>↗</span></a><div className="contact-meta"><p>+49 159 04047342<br />Obere Erlentiefen Str. 28<br />59192 Bergkamen</p><p>Mo – Fr · 09:00 – 18:00<br />Sa · 12:00 – 18:00</p></div></div></section>
    <SiteFooter />
  </main>;
}
