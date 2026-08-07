import { SiteFooter, SiteHeader } from "./components/SiteShell";

const clients = [
  ["PIECHA", "Handwerksbetrieb", "/clients/piechalogo.png"],
  ["ZIZOU", "Fashion", "/clients/zizou.gif"],
  ["VHG", "Dirk Grosser", "/clients/logo5.png"],
  ["urlaubduhnen.de", "MEERzeit", "/clients/ogo7.webp"],
  ["Podologie", "Gesundheit", "/clients/podologie.png"],
];

export default function Home() {
  return <main>
    <section className="hero" id="top">
      <div className="grain" aria-hidden="true" />
      <div className="orb orb-one" data-parallax="0.06" aria-hidden="true" />
      <div className="orb orb-two" data-parallax="-0.05" aria-hidden="true" />
      <div className="particles" aria-hidden="true">{Array.from({ length: 22 }, (_, index) => <i key={index} />)}</div>
      <SiteHeader />
      <div className="hero-content container">
        <p className="eyebrow reveal">Strategie · Digital · Objektservice</p>
        <h1 className="hero-title reveal delay-one">Wirkung beginnt<br />mit <em>klarer</em> Richtung.</h1>
        <div className="hero-bottom reveal delay-two"><p>Wir machen Unternehmen sichtbar, strukturierter und bereit für ihren nächsten Schritt.</p><a className="round-link" href="/leistungen" aria-label="Leistungen entdecken"><span>Entdecken</span><b>↓</b></a></div>
      </div>
      <div className="hero-footer container reveal delay-three"><p>Management, Marketing &amp; digitale Erlebnisse.</p><p>Seit 2018 · Bergkamen / überall</p></div>
    </section>

    <section className="kinetic-strip" aria-label="Pracht Performance Schwerpunkte"><div className="kinetic-track"><span>Strategie</span><b>✦</b><span>Marken</span><b>✦</b><span>Momentum</span><b>✦</b><span>Digital</span><b>✦</b><span>Strategie</span><b>✦</b><span>Marken</span><b>✦</b><span>Momentum</span><b>✦</b><span>Digital</span><b>✦</b></div></section>

    <section className="intro section container"><p className="section-kicker">Pracht Performance</p><div className="intro-grid"><h2>Weniger Lärm.<br /><em>Mehr Relevanz.</em></h2><div><p className="intro-copy">Gute Arbeit muss nicht laut sein. Sie muss die richtigen Menschen erreichen, Prozesse vereinfachen und Marken ein Gesicht geben, das man nicht vergisst.</p><a className="text-link" href="/ansatz">So arbeiten wir <span>↗</span></a></div></div></section>

    <section className="work-teaser section"><div className="container"><div className="section-head"><p className="section-kicker">Selected energy</p><p className="section-note">Kultur, Produkt und Handwerk – unterschiedlich im Ausdruck, verbunden in der Haltung.</p></div><div className="work-stage"><div className="stage-type"><span>Don&apos;t</span><span>blend</span><em>in.</em></div><figure className="stage-shot shot-one" data-parallax="-.08"><img src="/references/cityofgod.webp" alt="Referenzarbeit für Gambino36" /></figure><figure className="stage-shot shot-two" data-parallax=".08"><img src="/references/zizou-01.webp" alt="Referenzarbeit für Zizou Fashion" /></figure><div className="stage-index">01—03</div><a className="stage-link" href="/referenzen">Alle Arbeiten<br />ansehen <span>↗</span></a></div></div></section>

    <section className="signal-section"><div className="container"><div className="signal-top"><p className="section-kicker">Pracht / Signal</p><span>02</span></div><div className="signal-layout"><h2>Substanz<br />vor <em>Show.</em></h2><div className="signal-copy"><p>Unser Job ist nicht, etwas beliebig lauter zu machen. Sondern das Signal zu finden, das Ihre Marke unverwechselbar macht – und es so zu verstärken, dass es ankommt.</p><div className="signal-field" aria-hidden="true">{Array.from({ length: 49 }, (_, index) => <i key={index} />)}</div></div></div></div></section>

    <section className="clients section"><div className="container"><div className="section-head"><p className="section-kicker">Ausgewählte Kunden</p><p className="section-note">Partnerschaften, die auf Klarheit, Vertrauen und echter Zusammenarbeit beruhen.</p></div><div className="client-grid">{clients.map(([name, type, logo]) => <article className="client-logo" key={name}><img src={logo} alt={name} /><small>{type}</small></article>)}</div><a className="text-link clients-link" href="/referenzen">Alle Referenzen entdecken <span>↗</span></a></div></section>

    <section className="statement section container"><div className="statement-card"><p className="section-kicker">Unser Anspruch</p><blockquote>Aus Ideen<br />werden <em>Ergebnisse.</em></blockquote><p className="statement-copy">Keine Lösungen von der Stange. Wir verbinden unternehmerisches Denken mit Gestaltung, die sich richtig anfühlt – und richtig funktioniert.</p><div className="statement-mark" aria-hidden="true">P</div></div></section>
    <section className="home-services section"><div className="container"><p className="section-kicker">Was wir machen</p><div className="home-service-grid"><h2>Strategie, die<br /><em>in Bewegung bringt.</em></h2><div><p>Von der Positionierung bis zum digitalen Auftritt: Wir verbinden die Disziplinen, die Ihre Marke nach vorne bringen.</p><a className="round-link dark-round" href="/leistungen"><span>Leistungen</span><b>↗</b></a></div></div></div></section>
    <section className="contact"><div className="contact-orb" data-parallax="0.08" aria-hidden="true" /><div className="container contact-content"><p className="section-kicker">Kontakt</p><h2>Bereit für<br /><em>den nächsten Schritt?</em></h2><a className="mail-link" href="mailto:info@pracht-performance.de">info@pracht-performance.de <span>↗</span></a><div className="contact-meta"><p>+49 159 04047342<br />Obere Erlentiefen Str. 28<br />59192 Bergkamen</p><p>Mo – Fr · 09:00 – 18:00<br />Sa · 12:00 – 18:00</p></div></div></section>
    <SiteFooter />
  </main>;
}
