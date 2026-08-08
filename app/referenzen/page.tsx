import { ContactBand, PageIntro, SiteFooter } from "../components/SiteShell";

const references: [string, string, string, string, string, string[], string][] = [
  ["G36", "Gambino36", "Music Artist", "Album Cover & Brand Identity", "Komplette visuelle Betreuung für Releases über mehrere Jahre.", ["/references/ghetto.webp"], "cover"],
  ["H69", "Hemso069", "Music Artist", "Cover & visuelle Identität", "Konsistente visuelle Identität über alle Releases.", ["/references/hemso-01.webp", "/references/hemso-02.webp"], "cover"],
  ["ZZ", "Zizou Fashion", "Fashion Brand", "Design & Markenentwicklung", "Vollständige kreative Betreuung über drei Jahre.", ["/references/zizou-01.webp", "/references/zizou-02.webp"], "cover"],
  ["EB", "Eigenmarken & Produktdesign", "Brand Development", "Markenentwicklung", "Komplette Markenentwicklung für Amazon-Produkte und Eigenmarken.", ["/references/produkt-01.webp", "/references/produkt-02.webp"], "cover"],
  ["UD", "Urlaubduhnen.de", "Ferienwohnung Website", "Konzept & Website", "Nordsee-Ferienwohnung MEERzeit in Cuxhaven-Duhnen.", ["/clients/ogo7.webp"], "logo"],
  ["VHG", "VHG Dirk Grosser", "Handwerker Website", "Website-Entwicklung", "Terrassenüberdachungen, Wintergärten und Carports.", ["/clients/logo5.png"], "logo"],
];

export default function Referenzen() {
  return <main><PageIntro eyebrow="Referenzen" title={<>Arbeit, die<br /><em>eine Geschichte erzählt.</em></>} copy="Ausgewählte Projekte aus Musik, Mode, Branding und Website-Entwicklung." /><section className="references section container"><div className="reference-grid">{references.map(([, client, sector, service, copy, images, mode], index) => <article className={`reference-card ref-${index + 1}`} key={client}><div className={`reference-art has-image ${mode === "logo" ? "is-logo" : ""}`}>{images.map((image) => <img src={image} alt={`${client} Referenz`} key={image} />)}</div><div className="reference-info"><p>{sector}</p><h2>{client}</h2><h3>{service}</h3><p>{copy}</p><a href="/kontakt">Projekt anfragen <span>↗</span></a></div></article>)}</div></section><ContactBand /><SiteFooter /></main>;
}
