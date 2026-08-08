import { SiteFooter, SiteHeader } from "../components/SiteShell";

export const metadata = { title: "Impressum | Pracht Performance" };

export default function Impressum() {
  return <main className="legal-page">
    <section className="legal-hero"><SiteHeader /><div className="container legal-hero-content"><p>P/ — RECHTLICHES</p><h1>Impressum.</h1><span>01 / 02</span></div></section>
    <article className="container legal-content">
      <p className="legal-lead">Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG).</p>
      <section><h2>Verantwortlich für diese Website</h2><p><strong>Pracht Performance</strong><br />David Pracht<br />Obere Erlentiefenstraße 28<br />59192 Bergkamen<br />Deutschland</p></section>
      <section><h2>Kontakt</h2><p>Telefon: <a href="tel:+4915904047342">+49 159 04047342</a><br />E-Mail: <a href="mailto:info@pracht-performance.de">info@pracht-performance.de</a></p></section>
      <section><h2>Umsatzsteuer-ID</h2><p>Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br /><strong>DE321457227</strong></p></section>
      <section><h2>Verbraucherstreitbeilegung</h2><p>Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p></section>
      <section><h2>Haftung für Inhalte</h2><p>Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Eine Verpflichtung zur Überwachung übermittelter oder gespeicherter fremder Informationen besteht nach den allgemeinen gesetzlichen Vorschriften nicht. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen bleiben hiervon unberührt. Bei Bekanntwerden entsprechender Rechtsverletzungen entfernen wir diese Inhalte umgehend.</p></section>
      <section><h2>Haftung für Links</h2><p>Diese Website kann Links zu externen Websites Dritter enthalten. Auf deren Inhalte haben wir keinen Einfluss. Für die Inhalte verlinkter Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Bei Bekanntwerden von Rechtsverletzungen entfernen wir derartige Links umgehend.</p></section>
      <section><h2>Urheberrecht</h2><p>Die auf dieser Website erstellten Inhalte und Werke unterliegen dem deutschen Urheberrecht. Jede Verwertung außerhalb der Grenzen des Urheberrechts bedarf der vorherigen schriftlichen Zustimmung der jeweiligen Rechteinhaber. Inhalte Dritter sind als solche gekennzeichnet.</p></section>
      <p className="legal-updated">Stand: 8. August 2026</p>
    </article>
    <SiteFooter />
  </main>;
}
