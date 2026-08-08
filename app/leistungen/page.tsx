import { ContactBand, PageIntro, SiteFooter } from "../components/SiteShell";

const services = [
  ["01", "Strategisches Management", "Klarheit für Entscheidungen, Prozesse und die nächsten relevanten Schritte.", ["Analyse Ihrer Unternehmenssituation", "Individuelle Wachstumsstrategien", "Prozessoptimierung & Change Management", "KPI-Definition und Performance-Monitoring"]],
  ["02", "Digital Marketing", "Strategien und Inhalte, die Ihre Zielgruppe dort erreichen, wo sie sich bewegt.", ["Digitale Marketingstrategie", "Social Media & Content-Erstellung", "SEO, Google Ads & Advertising", "Analytics und Erfolgsmessung"]],
  ["03", "Business Analytics", "Daten werden erst dann wertvoll, wenn sie bessere Entscheidungen möglich machen.", ["Tracking- und Analytics-Setup", "Individuelle Dashboards & Reports", "Datenvisualisierung", "Conversion-Optimierung"]],
  ["04", "Brand Development", "Eine Markenidentität, die Haltung zeigt und wiedererkennbar bleibt.", ["Markenanalyse & Positionierung", "Corporate Identity", "Visuelle Markenelemente", "Brand Guidelines & Kommunikation"]],
  ["05", "Objektservice", "Professionelle Verwaltung und Optimierung für Immobilien und Objekte.", ["Objektbetreuung", "Strukturierte Abläufe", "Optimierung von Rentabilität", "Persönliche Ansprechpartner"]],
];

export default function Leistungen() {
  return <main className="inner-page"><PageIntro eyebrow="Leistungen" title={<>Komplexes einfach<br /><em>auf den Punkt.</em></>} copy="Maßgeschneiderte Lösungen für Unternehmen, die mit klarer Richtung wachsen möchten." /><section className="detail-services section container">{services.map(([number, title, copy, items]) => <article className="detail-service" key={number}><span>{number}</span><div><h2>{title}</h2><p>{copy}</p></div><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul><a href="/kontakt" aria-label={`${title} anfragen`}>↗</a></article>)}</section><ContactBand /><SiteFooter /></main>;
}
