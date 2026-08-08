import { SiteFooter, SiteHeader } from "./components/SiteShell";

const projects = [
  ["01", "Eigenmarken", "Produkt · Strategie · Markenwelt", "/references/produkt-01.webp", "image"],
  ["02", "E&N Dienstleistung", "Positionierung · Digital · Kommunikation", "/clients/Logo2.png", "logo"],
  ["03", "Urlaubduhnen", "Tourismus · Digitaler Auftritt · Content", "/clients/ogo7.webp", "logo"],
  ["04", "Zizou Fashion", "Fashion · Creative Direction · Social", "/references/zizou-01.webp", "image"],
];

const clients = [
  ["PIECHA", "Handwerksbetrieb", "/clients/piechalogo.png"],
  ["ZIZOU", "Fashion", "/clients/zizou.gif"],
  ["VHG", "Dirk Grosser", "/clients/logo5.png"],
  ["urlaubduhnen.de", "MEERzeit", "/clients/ogo7.webp"],
  ["Podologie", "Gesundheit", "/clients/podologie.png"],
];

export default function Home() {
  return <main className="home-v2">
    <section className="manifesto-hero" id="top">
      <SiteHeader />
      <div className="manifesto-ticker" aria-hidden="true"><div>STRATEGIE · MARKE · DIGITAL · OBJEKT · STRATEGIE · MARKE · DIGITAL · OBJEKT · </div></div>
      <div className="container manifesto-layout">
        <p className="manifesto-index hero-in hero-in-one">P/ — BERGKAMEN / 2026</p>
        <h1><span className="hero-in hero-in-two">Kein Auftritt</span><span className="hero-in hero-in-three">ohne</span><span className="hero-in hero-in-four"><em>Aussage.</em></span></h1>
        <div className="manifesto-mark hero-mark" data-parallax="-.06" aria-hidden="true"><span>P</span><i>/</i></div>
        <div className="manifesto-copy hero-in hero-in-five"><p>Wir geben Marken eine Form, eine Stimme und einen Auftritt, der nicht nach Aufmerksamkeit fragen muss.</p><a href="/kontakt">Projekt starten <span>↗</span></a></div>
        <p className="manifesto-note hero-in hero-in-six">Für Betriebe, Persönlichkeiten<br />und Marken mit Ambition.</p>
      </div>
      <div className="manifesto-scroll container hero-in hero-in-six"><span>Scroll, wenn du bereit bist</span><i aria-hidden="true" /><span>↓</span></div>
    </section>

    <section className="home-intro"><div className="container"><p className="section-kicker">Pracht Performance / Independent since 2018</p><div className="home-intro-copy"><h2>Wir bauen keine<br />Auftritte. Wir bauen<br /><em>Wiedererkennung.</em></h2><p>Strategie, Gestaltung und operative Umsetzung gehören für uns zusammen. Nur so entsteht eine Marke, die nicht beim ersten Kontakt endet.</p></div></div></section>

    <section className="project-ledger"><div className="container"><div className="ledger-head"><p className="section-kicker">Selected work</p><p>Eigene Marken, echte Betriebe und digitale Erlebnisse mit einer klaren Handschrift.</p></div><div className="project-list">{projects.map(([number, title, category, image, kind]) => <article className={`project-row project-${kind}`} key={title}><div className="project-count">{number}</div><div className="project-image" data-parallax="-.04"><img src={image} alt={`${title} Projektarbeit`} /></div><div className="project-title"><h2>{title}</h2><p>{category}</p></div><a href="/referenzen" aria-label={`${title} Referenz ansehen`}>↗</a></article>)}</div><a className="ledger-link" href="/referenzen">Alle Referenzen ansehen <span>↗</span></a></div></section>

    <section className="argument"><div className="container argument-grid"><div className="argument-label"><span>02</span><p>Was wir anders machen</p></div><blockquote>„Wenn ein Auftritt<br />austauschbar ist,<br />ist er <em>zu spät.</em>“</blockquote><div className="argument-note"><p>Wir suchen zuerst nach dem Kern – nicht nach dem nächsten Trend. Daraus entwickeln wir Systeme, die im Alltag funktionieren und im Kopf bleiben.</p><a href="/ansatz">Unser Ansatz <span>↗</span></a></div></div></section>

    <section className="home-services-v2"><div className="container"><p className="section-kicker">Felder, in denen wir arbeiten</p><div className="service-columns"><a href="/leistungen"><span>01</span><strong>Strategie</strong><em>Richtung<br />schaffen</em></a><a href="/leistungen"><span>02</span><strong>Marke</strong><em>Haltung<br />zeigen</em></a><a href="/leistungen"><span>03</span><strong>Digital</strong><em>Reichweite<br />bewegen</em></a><a href="/leistungen"><span>04</span><strong>Objekt</strong><em>Werte<br />bewahren</em></a></div></div></section>

    <section className="home-clients"><div className="container"><div className="ledger-head"><p className="section-kicker">Vertrauen</p><p>Unterschiedliche Branchen. Ein gemeinsamer Anspruch an Substanz.</p></div><div className="client-grid">{clients.map(([name, type, logo]) => <article className="client-logo" key={name}><img src={logo} alt={name} /><small>{type}</small></article>)}</div></div></section>

    <section className="home-contact"><div className="container"><p className="section-kicker">Nächster Schritt</p><h2>Ein Projekt, das<br /><em>nicht egal ist.</em></h2><a href="mailto:info@pracht-performance.de">info@pracht-performance.de <span>↗</span></a><p className="home-contact-meta">Bergkamen, überall.<br />Strategie, Marke, Digital, Objekt.</p></div></section>
    <SiteFooter />
  </main>;
}
