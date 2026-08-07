const services = [
  ["01", "Strategie", "Klarheit für Entscheidungen, Prozesse und die nächsten relevanten Schritte."],
  ["02", "Digital", "Markenauftritt, Marketing und Webdesign mit einem roten Faden."],
  ["03", "Performance", "Messen, verbessern und nachhaltig Wirkung erzielen – ohne Aktionismus."],
  ["04", "Objektservice", "Professionelle Betreuung und Optimierung von Immobilien und Objekten."],
];

const process = [
  ["01", "Verstehen", "Wir hören zu, ordnen ein und finden heraus, was wirklich zählt."],
  ["02", "Fokussieren", "Aus Erkenntnissen entsteht eine klare Richtung mit Prioritäten."],
  ["03", "Umsetzen", "Wir bringen Strategie, Design und Kommunikation zusammen."],
  ["04", "Weiterdenken", "Wir optimieren dort, wo Wirkung und Wachstum entstehen."],
];

export default function Home() {
  return (
    <main>
      <section className="hero" id="top">
        <div className="grain" aria-hidden="true" />
        <div className="orb orb-one" aria-hidden="true" />
        <div className="orb orb-two" aria-hidden="true" />
        <div className="particles" aria-hidden="true">
          {Array.from({ length: 22 }, (_, index) => <i key={index} />)}
        </div>

        <header className="site-header container">
          <a className="brand" href="#top" aria-label="Pracht Performance – Startseite">
            <span>Pracht</span><small>Performance</small>
          </a>
          <nav aria-label="Hauptnavigation">
            <a href="#leistungen">Leistungen</a>
            <a href="#ansatz">Ansatz</a>
            <a href="#kontakt">Kontakt</a>
          </nav>
          <a className="header-cta" href="#kontakt">Projekt anfragen <span>↗</span></a>
        </header>

        <div className="hero-content container">
          <p className="eyebrow reveal">Strategie · Digital · Objektservice</p>
          <h1 className="hero-title reveal delay-one">Wirkung beginnt<br />mit <em>klarer</em> Richtung.</h1>
          <div className="hero-bottom reveal delay-two">
            <p>Wir machen Unternehmen sichtbar, strukturierter und bereit für ihren nächsten Schritt.</p>
            <a className="round-link" href="#leistungen" aria-label="Leistungen entdecken"><span>Entdecken</span><b>↓</b></a>
          </div>
        </div>

        <div className="hero-footer container reveal delay-three">
          <p>Management, Marketing &amp; digitale Erlebnisse.</p>
          <p>Seit 2018 · Bergkamen / überall</p>
        </div>
      </section>

      <section className="intro section container">
        <p className="section-kicker">Pracht Performance</p>
        <div className="intro-grid">
          <h2>Weniger Lärm.<br /><em>Mehr Relevanz.</em></h2>
          <div>
            <p className="intro-copy">Gute Arbeit muss nicht laut sein. Sie muss die richtigen Menschen erreichen, Prozesse vereinfachen und Marken ein Gesicht geben, das man nicht vergisst.</p>
            <a className="text-link" href="#kontakt">Lassen Sie uns sprechen <span>↗</span></a>
          </div>
        </div>
      </section>

      <section className="services section" id="leistungen">
        <div className="container">
          <div className="section-head">
            <p className="section-kicker">Leistungen</p>
            <p className="section-note">Für Unternehmen, die nicht einfach nur mithalten wollen.</p>
          </div>
          <div className="service-list">
            {services.map(([number, title, copy]) => (
              <article className="service" key={number}>
                <span className="service-number">{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
                <span className="service-arrow" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="statement section container">
        <div className="statement-card">
          <p className="section-kicker">Unser Anspruch</p>
          <blockquote>Aus Ideen<br />werden <em>Ergebnisse.</em></blockquote>
          <p className="statement-copy">Keine Lösungen von der Stange. Wir verbinden unternehmerisches Denken mit Gestaltung, die sich richtig anfühlt – und richtig funktioniert.</p>
          <div className="statement-mark" aria-hidden="true">P</div>
        </div>
      </section>

      <section className="process section" id="ansatz">
        <div className="container">
          <div className="section-head">
            <p className="section-kicker">Zusammenarbeit</p>
            <p className="section-note">Strukturiert im Vorgehen. Persönlich im Austausch.</p>
          </div>
          <div className="process-grid">
            {process.map(([number, title, copy]) => (
              <article className="process-step" key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="contact" id="kontakt">
        <div className="contact-orb" aria-hidden="true" />
        <div className="container contact-content">
          <p className="section-kicker">Kontakt</p>
          <h2>Bereit für<br /><em>den nächsten Schritt?</em></h2>
          <a className="mail-link" href="mailto:info@pracht-performance.de">info@pracht-performance.de <span>↗</span></a>
          <div className="contact-meta">
            <p>+49 159 04047342<br />Obere Erlentiefen Str. 28<br />59192 Bergkamen</p>
            <p>Mo – Fr · 09:00 – 18:00<br />Sa · 12:00 – 18:00</p>
          </div>
        </div>
      </section>

      <footer className="footer container">
        <a className="brand" href="#top"><span>Pracht</span><small>Performance</small></a>
        <p>© {new Date().getFullYear()} Pracht Performance</p>
        <div><a href="#top">Impressum</a><a href="#top">Datenschutz</a></div>
      </footer>
    </main>
  );
}
