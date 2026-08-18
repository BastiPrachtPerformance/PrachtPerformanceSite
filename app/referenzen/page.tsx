import { ContactBand, PageIntro, SiteFooter } from "../components/SiteShell";

export const dynamic = "force-static";

const references: [string, string, string, string, string, string[], string][] = [
  ["ZC", "zizouclothing.com", "Fashion Website", "Konzept & Website", "Digitaler Auftritt f\u00fcr die Fashion Brand ZIZOU.", ["/references/zizou-background.gif"], "cover"],
  ["EN", "E&N Dienstleistung GbR", "Technische Betreuung", "Programme, Website & Support", "Ganzheitliche technische Betreuung: eigene Programme, Website-Entwicklung und laufender technischer Support.", ["/references/en-dienstleistung.png"], "cover"],
  ["EB", "Eigenmarken & Produktdesign", "Brand Development", "Markenentwicklung", "Komplette Markenentwicklung f\u00fcr Amazon-Produkte und Eigenmarken.", ["/references/produkt-01.webp", "/references/produkt-02.webp"], "cover"],
  ["UD", "Urlaubduhnen.de", "Ferienwohnung Website", "Konzept & Website", "Nordsee-Ferienwohnung MEERzeit in Cuxhaven-Duhnen.", ["/references/urlaubduhnen.png"], "cover"],
  ["CK", "CKEVENTCENTER Bergkamen", "Eventlocation Website", "Konzept & Website", "Website f\u00fcr Hochzeiten, Feiern und besondere Momente in Bergkamen.", ["/references/ckeventcenter.png"], "cover"],
  ["VHG", "VHG Dirk Grosser", "Handwerker Website", "Website-Entwicklung", "Terrassen\u00fcberdachungen, Winterg\u00e4rten und Carports.", ["/references/vhg.png"], "cover"],
  ["ZZ", "Zizou Fashion", "Fashion Brand", "Design & Markenentwicklung", "Vollst\u00e4ndige kreative Betreuung \u00fcber drei Jahre.", ["/references/zizou-01.webp", "/references/zizou-02.webp"], "cover"],
  ["H69", "Hemso069", "Music Artist", "Cover & visuelle Identit\u00e4t", "Konsistente visuelle Identit\u00e4t \u00fcber alle Releases.", ["/references/hemso-01.webp", "/references/hemso-02.webp"], "cover"],
  ["G36", "Gambino36", "Music Artist", "Album Cover & Brand Identity", "Komplette visuelle Betreuung f\u00fcr Releases \u00fcber mehrere Jahre.", ["/references/ghetto.webp", "/references/cityofgod.webp"], "cover"],
  ["KB", "Kebinny", "Music Artist", "Cover Design", "Coverdesigns und visuelle Gestaltung f\u00fcr Musik-Releases von Kebinny.", ["/references/kebinny.png"], "cover"],
];

export default function Referenzen() {
  return (
    <main className="inner-page">
      <PageIntro
        eyebrow="Referenzen"
        title={<>Arbeit, die<br /><em>eine Geschichte {"erz\u00e4hlt."}</em></>}
        copy={"Ausgew\u00e4hlte Projekte aus Musik, Mode, Branding und Website-Entwicklung."}
      />
      <section className="references section container">
        <div className="reference-grid">
          {references.map(([, client, sector, service, copy, images, mode], index) => (
            <article className={`reference-card ref-${index + 1}`} key={client}>
              <div className={`reference-art has-image ${mode === "logo" ? "is-logo" : ""}`}>
                {images.map((image) => <img src={image} alt={`${client} Referenz`} key={image} />)}
              </div>
              <div className="reference-info">
                <p>{sector}</p>
                <h2>{client}</h2>
                <h3>{service}</h3>
                <p>{copy}</p>
              </div>
            </article>
          ))}
        </div>
        <a className="references-contact-button" href="/kontakt.html">Kontakt aufnehmen <span>{"\u2197"}</span></a>
      </section>
      <ContactBand />
      <SiteFooter />
    </main>
  );
}
