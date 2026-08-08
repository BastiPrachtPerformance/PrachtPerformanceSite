import { SiteFooter, SiteHeader } from "../components/SiteShell";

export const metadata = { title: "Datenschutz | Pracht Performance" };

export default function Datenschutz() {
  return <main className="legal-page">
    <section className="legal-hero"><SiteHeader /><div className="container legal-hero-content"><p>P/ — RECHTLICHES</p><h1>Daten&shy;schutz.</h1><span>02 / 02</span></div></section>
    <article className="container legal-content">
      <p className="legal-lead">Der Schutz Ihrer persönlichen Daten ist uns wichtig. Nachfolgend informieren wir Sie über die Verarbeitung personenbezogener Daten beim Besuch dieser Website.</p>
      <section><h2>Verantwortlicher</h2><p><strong>David Pracht / Pracht Performance</strong><br />Obere Erlentiefenstraße 28<br />59192 Bergkamen<br />Telefon: <a href="tel:+4915161740318">+49 1516 1740318</a><br />E-Mail: <a href="mailto:info@pracht-performance.de">info@pracht-performance.de</a></p></section>
      <section><h2>Bereitstellung der Website</h2><p>Beim Aufruf dieser Website verarbeitet der technisch eingesetzte Hosting-Dienst Daten, die Ihr Browser übermittelt. Dazu können insbesondere IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seiten, Referrer-URL, Browsertyp, Betriebssystem und übertragene Datenmenge gehören. Die Verarbeitung erfolgt zur technischen Bereitstellung, Stabilität und Sicherheit der Website auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Die Daten werden nur so lange gespeichert, wie dies für diese Zwecke erforderlich ist.</p></section>
      <section><h2>Kontaktaufnahme</h2><p>Wenn Sie uns per E-Mail oder Telefon kontaktieren, verarbeiten wir die von Ihnen übermittelten Daten zur Bearbeitung Ihres Anliegens und für eventuelle Anschlussfragen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit Ihre Anfrage auf den Abschluss oder die Durchführung eines Vertrags gerichtet ist, im Übrigen Art. 6 Abs. 1 lit. f DSGVO. Die Daten löschen wir, sobald sie für die Bearbeitung nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</p></section>
      <section><h2>Cookies und ähnliche Technologien</h2><p>Diese Website verwendet ausschließlich technisch notwendige Technologien für die sichere und zuverlässige Bereitstellung. Analyse-, Marketing- und Tracking-Cookies werden nicht eingesetzt. Soweit technisch notwendige Speicherungen oder Sicherheitsmechanismen erforderlich sind, erfolgen diese auf Grundlage von § 25 Abs. 2 TDDDG und Art. 6 Abs. 1 lit. f DSGVO. Wenn künftig optionale Dienste, eingebettete Inhalte oder Tracking eingesetzt werden, wird diese Erklärung aktualisiert und eine erforderliche Einwilligung eingeholt.</p></section>
      <section><h2>Empfänger und Auftragsverarbeiter</h2><p>Für den technischen Betrieb der Website können sorgfältig ausgewählte IT- und Hosting-Dienstleister eingesetzt werden. Diese verarbeiten personenbezogene Daten ausschließlich in unserem Auftrag und auf Grundlage geeigneter vertraglicher Vereinbarungen, soweit dies rechtlich erforderlich ist.</p></section>
      <section><h2>Ihre Rechte</h2><p>Sie haben das Recht auf Auskunft über die Sie betreffenden personenbezogenen Daten sowie auf Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. e oder f DSGVO. Erteilte Einwilligungen können Sie jederzeit mit Wirkung für die Zukunft widerrufen. Zur Ausübung Ihrer Rechte genügt eine Nachricht an <a href="mailto:info@pracht-performance.de">info@pracht-performance.de</a>.</p></section>
      <section><h2>Beschwerderecht</h2><p>Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren. Zuständig ist insbesondere die Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen, Kavalleriestraße 2–4, 40213 Düsseldorf, <a href="mailto:poststelle@ldi.nrw.de">poststelle@ldi.nrw.de</a>, <a href="https://www.ldi.nrw.de" target="_blank" rel="noreferrer">www.ldi.nrw.de</a>.</p></section>
      <section><h2>Aktualität dieser Datenschutzerklärung</h2><p>Wir passen diese Datenschutzerklärung an, wenn Änderungen an dieser Website oder rechtliche Vorgaben dies erforderlich machen.</p></section>
      <p className="legal-updated">Stand: 8. August 2026</p>
    </article>
    <SiteFooter />
  </main>;
}
