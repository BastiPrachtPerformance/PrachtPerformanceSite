import { PageIntro, SiteFooter } from "../components/SiteShell";

export default function Kontakt() {
  return <main className="inner-page"><PageIntro eyebrow="Kontakt" title={<>Lassen Sie uns<br /><em>etwas bewegen.</em></>} copy="Erzählen Sie uns von Ihrem Vorhaben. Wir melden uns persönlich bei Ihnen zurück."><a className="page-email" href="mailto:info@pracht-performance.de">info@pracht-performance.de ↗</a></PageIntro><section className="contact-page section container"><div><p className="section-kicker">Direkt erreichbar</p><a className="contact-big" href="tel:+4915904047342">+49 159 04047342</a></div><div className="contact-address"><p>Obere Erlentiefen Str. 28<br />59192 Bergkamen</p><p>Mo – Fr · 09:00 – 18:00<br />Sa · 12:00 – 18:00</p></div></section><SiteFooter /></main>;
}
