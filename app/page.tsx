import { SiteFooter, SiteHeader } from "./components/SiteShell";

const clients = [
  ["PIECHA", "Handwerksbetrieb", "/clients/piecha.svg"],
  ["ZIZOU", "Fashion", "/clients/zizou.gif"],
  ["KRD Group", "Modulbäder", "/clients/Logo3.png"],
  ["urlaubduhnen.de", "MEERzeit", "/clients/ogo7.webp"],
  ["Dirk Grosser", "Überdachungen", "/clients/logo5.png"],
  ["CKEVENTCENTER Bergkamen", "Eventlocation", "/clients/ckeventcenter-bergkamen.png"],
  ["Berendsohn", "Werbemittel", "/clients/Logo2.png"],
  ["Ennovex", "Energieverwaltung", "/clients/ennovex.png"],
];

export default function Home() {
  return <main className="home-v2">
    <section className="editorial-hero" id="top">
      <SiteHeader />
      <div className="editorial-glow" aria-hidden="true" />
      <div className="editorial-particles" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <i key={index} />)}</div>
      <div className="container editorial-hero-layout">
        <p className="editorial-index editorial-in editorial-delay-one">P/ — BERGKAMEN · DE</p>
        <h1><span className="editorial-in editorial-delay-two">Mehr als</span><span className="editorial-in editorial-delay-three"><em>sichtbar.</em></span></h1>
        <div className="editorial-copy editorial-in editorial-delay-four"><p>Strategie, Gestaltung und Umsetzung für Marken, die nicht nur gut aussehen, sondern etwas auslösen.</p><a href="/kontakt.html">Projekt anfragen <span>↗</span></a></div>
        <aside className="editorial-coordinates editorial-in editorial-delay-five" aria-label="Standort Bergkamen"><div><span>51.617° N</span><span>07.645° E</span><strong>Bergkamen / DE</strong><small>Arbeitsradius: überall.</small></div></aside>
        <div className="editorial-fields editorial-in editorial-delay-five"><span>Strategische Beratung</span><span>Markenentwicklung</span><span>Digitale Lösungen</span><span>Objektbetreuung</span></div>
      </div>
    </section>

    <section className="home-intro"><div className="container"><p className="section-kicker">Pracht Performance / Independent since 2018</p><div className="home-intro-copy"><h2 data-parallax=".022">Wir bauen keine<br />Auftritte. Wir bauen<br /><em>Wiedererkennung.</em></h2><p>Strategie, Gestaltung und operative Umsetzung gehören für uns zusammen. Nur so entsteht eine Marke, die nicht beim ersten Kontakt endet.</p></div></div></section>

    <section className="argument"><div className="container argument-grid"><div className="argument-label"><span>02</span><p>Was wir anders machen</p></div><blockquote data-parallax=".015">„Wenn ein Auftritt<br />austauschbar ist,<br />ist er <em>zu spät.</em>“</blockquote><div className="argument-note"><p>Wir suchen zuerst nach dem Kern – nicht nach dem nächsten Trend. Daraus entwickeln wir Systeme, die im Alltag funktionieren und im Kopf bleiben.</p><a href="/ansatz.html">Unser Ansatz <span>↗</span></a></div></div></section>

    <section className="home-services-v2"><div className="container"><p className="section-kicker">Felder, in denen wir arbeiten</p><div className="service-columns"><a href="/leistungen.html"><span>01</span><strong>Strategie</strong><em>Richtung<br />schaffen</em></a><a href="/leistungen.html"><span>02</span><strong>Marke</strong><em>Haltung<br />zeigen</em></a><a href="/leistungen.html"><span>03</span><strong>Digital</strong><em>Reichweite<br />bewegen</em></a><a href="/leistungen.html"><span>04</span><strong>Objekt</strong><em>Werte<br />bewahren</em></a></div></div></section>

    <section className="home-clients"><div className="container"><div className="ledger-head"><p className="section-kicker">Vertrauen</p><p>Unterschiedliche Branchen. Ein gemeinsamer Anspruch an Substanz.</p></div><div className="client-grid">{clients.map(([name, type, logo]) => <article className="client-logo" key={name}><img src={logo} alt={name} /><small>{type}</small></article>)}</div></div></section>

    <section className="home-contact"><div className="container"><p className="section-kicker">Nächster Schritt</p><h2 data-parallax=".018">Ein Projekt, das<br /><em>nicht egal ist.</em></h2><a href="mailto:info@pracht-performance.de">info@pracht-performance.de <span>↗</span></a><p className="home-contact-meta">Bergkamen, überall.<br />Strategie, Marke, Digital, Objekt.</p></div></section>
    <SiteFooter />
  </main>;
}
