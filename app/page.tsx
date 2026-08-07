import { SiteFooter, SiteHeader } from "./components/SiteShell";

const projects = [
  ["01", "Gambino36", "Cover Art · Markenwelt", "/references/cityofgod.webp"],
  ["02", "Zizou Fashion", "Fashion · Creative Direction", "/references/zizou-01.webp"],
  ["03", "Hemso069", "Visual Identity · Music", "/references/hemso-01.webp"],
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
    <section className="edition-hero" id="top">
      <SiteHeader />
      <div className="container edition-grid">
        <p className="edition-number">01 / 05</p>
        <h1>Keine<br /><em>Fassade.</em><br />Eine Haltung.</h1>
        <figure className="edition-cover" data-parallax="-.05"><img src="/references/cityofgod.webp" alt="Cover-Art-Referenz von Gambino36" /><figcaption>Gambino36 / City of God<br />Cover Art, 2024</figcaption></figure>
        <div className="edition-copy"><p>Wir arbeiten an dem, was Unternehmen unverwechselbar macht: Position, Ausdruck und der Mut, nicht wie alle anderen zu wirken.</p><a href="/kontakt">Projekt starten <span>↗</span></a></div>
      </div>
      <div className="edition-scroll container"><span>Scroll to read</span><i aria-hidden="true" /><span>BERGKAMEN / DE</span></div>
    </section>

    <section className="home-intro"><div className="container"><p className="section-kicker">Pracht Performance / Independent since 2018</p><div className="home-intro-copy"><h2>Wir bauen keine<br />Auftritte. Wir bauen<br /><em>Wiedererkennung.</em></h2><p>Strategie, Gestaltung und operative Umsetzung gehören für uns zusammen. Nur so entsteht eine Marke, die nicht beim ersten Kontakt endet.</p></div></div></section>

    <section className="project-ledger"><div className="container"><div className="ledger-head"><p className="section-kicker">Selected work</p><p>3 von vielen unterschiedlichen Wegen, Sichtbarkeit ernst zu nehmen.</p></div><div className="project-list">{projects.map(([number, title, category, image]) => <article className="project-row" key={title}><div className="project-count">{number}</div><div className="project-image" data-parallax="-.04"><img src={image} alt={`${title} Projektarbeit`} /></div><div className="project-title"><h2>{title}</h2><p>{category}</p></div><a href="/referenzen" aria-label={`${title} Referenz ansehen`}>↗</a></article>)}</div><a className="ledger-link" href="/referenzen">Alle Referenzen ansehen <span>↗</span></a></div></section>

    <section className="argument"><div className="container argument-grid"><div className="argument-label"><span>02</span><p>Was wir anders machen</p></div><blockquote>„Wenn ein Auftritt<br />austauschbar ist,<br />ist er <em>zu spät.</em>“</blockquote><div className="argument-note"><p>Wir suchen zuerst nach dem Kern – nicht nach dem nächsten Trend. Daraus entwickeln wir Systeme, die im Alltag funktionieren und im Kopf bleiben.</p><a href="/ansatz">Unser Ansatz <span>↗</span></a></div></div></section>

    <section className="home-services-v2"><div className="container"><p className="section-kicker">Felder, in denen wir arbeiten</p><div className="service-columns"><a href="/leistungen"><span>01</span><strong>Strategie</strong><em>Richtung<br />schaffen</em></a><a href="/leistungen"><span>02</span><strong>Marke</strong><em>Haltung<br />zeigen</em></a><a href="/leistungen"><span>03</span><strong>Digital</strong><em>Reichweite<br />bewegen</em></a><a href="/leistungen"><span>04</span><strong>Objekt</strong><em>Werte<br />bewahren</em></a></div></div></section>

    <section className="home-clients"><div className="container"><div className="ledger-head"><p className="section-kicker">Vertrauen</p><p>Unterschiedliche Branchen. Ein gemeinsamer Anspruch an Substanz.</p></div><div className="client-grid">{clients.map(([name, type, logo]) => <article className="client-logo" key={name}><img src={logo} alt={name} /><small>{type}</small></article>)}</div></div></section>

    <section className="home-contact"><div className="container"><p className="section-kicker">Nächster Schritt</p><h2>Ein Projekt, das<br /><em>nicht egal ist.</em></h2><a href="mailto:info@pracht-performance.de">info@pracht-performance.de <span>↗</span></a><p className="home-contact-meta">Bergkamen, überall.<br />Strategie, Marke, Digital, Objekt.</p></div></section>
    <SiteFooter />
  </main>;
}
