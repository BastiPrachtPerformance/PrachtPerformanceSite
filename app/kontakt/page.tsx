import { PageIntro, SiteFooter } from "../components/SiteShell";

export const dynamic = "force-static";

const topics = [
  ["Marke & Positionierung", "Marke"],
  ["Website & Digitales", "Digital"],
  ["Marketing & Content", "Marketing"],
  ["Objektservice", "Objektservice"],
];

export default function Kontakt() {
  return <main className="inner-page contact-detail-page"><PageIntro eyebrow="Kontakt" title={<>Lassen Sie uns<br /><em>etwas bewegen.</em></>} copy="Erzählen Sie uns von Ihrem Vorhaben. Wir melden uns persönlich bei Ihnen zurück."><a className="page-email" href="mailto:info@pracht-performance.de">info@pracht-performance.de ↗</a></PageIntro><section className="contact-intent"><div className="container"><p className="section-kicker">Worum geht es?</p><div className="contact-intent-grid"><h2>Eine gute Nachricht<br />ist der <em>Anfang.</em></h2><p>Ob Idee, konkrete Herausforderung oder ein Projekt, das schon lange in der Schublade liegt: Schreiben Sie uns ein paar Zeilen. Wir melden uns persönlich zurück und sortieren gemeinsam den nächsten sinnvollen Schritt.</p></div><div className="contact-topic-grid">{topics.map(([label, subject], index) => <a href={`mailto:info@pracht-performance.de?subject=${encodeURIComponent(subject)}`} key={subject}><span>0{index + 1}</span><strong>{label}</strong><b>↗</b></a>)}</div></div></section><section className="contact-details section"><div className="container"><p className="section-kicker">Direkt erreichbar</p><div className="contact-details-grid"><a className="contact-detail-main" href="mailto:info@pracht-performance.de"><span>E-Mail</span><strong>info@pracht-performance.de</strong><b>↗</b></a><a className="contact-detail-main" href="tel:+4915161740318"><span>Telefon</span><strong>+49 1516 1740318</strong><b>↗</b></a><div className="contact-detail-small"><span>Studio</span><p>Obere Erlentiefen Str. 28<br />59192 Bergkamen</p></div><div className="contact-detail-small"><span>Erreichbarkeit</span><p>Mo – Fr · 09:00 – 18:00<br />Sa · 12:00 – 18:00</p></div></div></div></section><SiteFooter /></main>;
}
