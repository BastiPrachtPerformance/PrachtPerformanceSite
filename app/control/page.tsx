"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type SiteState = "Aktiv" | "Wartung" | "404";

type Site = {
  id: string;
  name: string;
  domain: string;
  hosting: string;
  visits: string;
  state: SiteState;
  update: string;
};

const initialSites: Site[] = [
  { id: "pracht", name: "Pracht Performance", domain: "pracht-performance.de", hosting: "Netlify", visits: "1.284", state: "Aktiv", update: "Heute, 09:42" },
  { id: "ck", name: "CKEVENTCENTER", domain: "ckeventcenter.de", hosting: "Netlify", visits: "847", state: "Aktiv", update: "Heute, 09:36" },
  { id: "en", name: "E&N Dienstleistung", domain: "en-dienstleistung.de", hosting: "Netlify", visits: "603", state: "Aktiv", update: "Heute, 09:27" },
  { id: "ud", name: "Urlaub Duhnen", domain: "urlaubduhnen.de", hosting: "Netlify", visits: "491", state: "Wartung", update: "Gestern, 18:10" },
  { id: "zizou", name: "ZIZOU Clothing", domain: "zizouclothing.com", hosting: "Netlify", visits: "328", state: "Aktiv", update: "Gestern, 15:20" },
  { id: "vhg", name: "VHG Dirk Grosser", domain: "vhg.de", hosting: "Netlify", visits: "215", state: "Aktiv", update: "07. Aug., 11:08" },
];

const trafficBars = [40, 56, 44, 71, 64, 92, 76, 58, 83, 68, 74, 97, 63, 87, 79, 100, 81, 72];

export default function ControlPage() {
  const [sites, setSites] = useState(initialSites);
  const [selectedId, setSelectedId] = useState("ck");
  const [notice, setNotice] = useState("Vorschau-Modus: Es wird keine echte Kundenwebsite verändert.");
  const [logs, setLogs] = useState([
    "09:36 · CKEVENTCENTER erfolgreich geprüft",
    "09:31 · Traffic-Daten synchronisiert",
    "Gestern · Urlaub Duhnen in Wartung gesetzt",
  ]);

  const [authState, setAuthState] = useState<"loading" | "authenticated" | "guest">("loading");
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  async function loadDashboard() {
    const response = await fetch("/api/control", { credentials: "same-origin" });
    if (!response.ok) return;
    const data = await response.json() as { sites?: Site[]; logs?: string[] };
    if (data.sites) setSites(data.sites);
    if (data.logs) setLogs(data.logs);
  }

  useEffect(() => {
    fetch("/api/control-auth", { credentials: "same-origin" })
      .then(async (response) => ({ ok: response.ok, data: await response.json() as { authenticated?: boolean; configured?: boolean } }))
      .then(({ data }) => {
        if (data.authenticated) {
          setAuthState("authenticated");
          void loadDashboard();
          return;
        }
        setAuthState("guest");
        if (data.configured === false) setLoginMessage("Pracht Control muss zuerst in Netlify aktiviert werden.");
      })
      .catch(() => {
        setAuthState("guest");
        setLoginMessage("Die sichere Control-Verbindung ist noch nicht aktiv.");
      });
  }, []);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginMessage("");
    const response = await fetch("/api/control-auth", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
    const data = await response.json() as { authenticated?: boolean; error?: string };
    if (!response.ok || !data.authenticated) {
      setLoginMessage(data.error ?? "Anmeldung nicht möglich.");
      return;
    }
    setPassword("");
    setAuthState("authenticated");
    await loadDashboard();
  }

  async function persistState(state: SiteState) {
    const response = await fetch("/api/control", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "set-site-state", siteId: selectedSite.id, state }) });
    if (!response.ok) return;
    const data = await response.json() as { sites?: Site[]; logs?: string[] };
    if (data.sites) setSites(data.sites);
    if (data.logs) setLogs(data.logs);
  }

  async function logout() {
    await fetch("/api/control-auth?action=logout", { method: "POST", credentials: "same-origin" });
    setAuthState("guest");
  }

  const selectedSite = useMemo(() => sites.find((site) => site.id === selectedId) ?? sites[0], [selectedId, sites]);
  const onlineCount = sites.filter((site) => site.state === "Aktiv").length;

  function updateState(state: SiteState) {
    setSites((current) => current.map((site) => site.id === selectedSite.id ? { ...site, state, update: "Gerade eben" } : site));
    setNotice(`${selectedSite.name}: ${state} vorgemerkt. In dieser Vorschau bleibt die Website unverändert.`);
    setLogs((current) => [`Gerade eben · ${selectedSite.name}: Status ${state} vorgemerkt`, ...current].slice(0, 4));
  }

  if (authState !== "authenticated") {
    return <main className="control-login-shell"><section className="control-login-card"><a className="control-brand" href="/"><img src="/preview.png" alt="Pracht Performance" /><b>PRACHT<br />CONTROL</b></a><p className="control-kicker">Geschützter Bereich</p><h1>Die Steuerung<br /><em>gehört dir.</em></h1><p>Bitte melde dich an, um Kundenwebsites, Traffic und Status zentral zu verwalten.</p><form onSubmit={submitLogin}><label htmlFor="control-password">Passwort</label><input id="control-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required disabled={authState === "loading"} /><button type="submit" disabled={authState === "loading"}>{authState === "loading" ? "Verbindung wird geprüft" : "Control öffnen"} <span>{"\u2197"}</span></button></form>{loginMessage && <small className="control-login-message">{loginMessage}</small>}</section></main>;
  }

  return (
    <main className="control-shell">
      <aside className="control-sidebar">
        <a className="control-brand" href="/" aria-label="Zur Pracht Performance Startseite"><span>P</span><b>PRACHT<br />CONTROL</b></a>
        <nav className="control-nav" aria-label="Control Navigation">
          <a className="is-active" href="#overview"><i>01</i> Übersicht</a>
          <a href="#customers"><i>02</i> Kunden</a>
          <a href="#traffic"><i>03</i> Traffic</a>
          <a href="#activity"><i>04</i> Aktivität</a>
        </nav>
        <div className="control-account"><span>BP</span><p><b>Bastian Pracht</b><small>Administrator</small></p><button type="button" aria-label="Abmelden" onClick={() => void logout()}>Aus</button></div>
      </aside>

      <section className="control-main" id="overview">
        <header className="control-topbar">
          <div><p className="control-kicker">Pracht Control / 2026</p><h1>Guten Morgen,<br /><em>Bastian.</em></h1></div>
          <div className="control-live"><span></span> Alle Systeme erreichbar</div>
        </header>

        <div className="control-preview">{notice}<b>DEMO</b></div>

        <section className="control-metrics" aria-label="Übersicht Kennzahlen">
          <article><p>Betreute Websites</p><strong>{sites.length}</strong><small>+ 1 in diesem Monat</small></article>
          <article><p>Aktiv erreichbar</p><strong>{onlineCount}<i>/{sites.length}</i></strong><small>Alle Endpunkte geprüft</small></article>
          <article><p>Besuche / 30 Tage</p><strong>3.768</strong><small>+ 18,4 % zum Vormonat</small></article>
          <article><p>Neue Anfragen</p><strong>47</strong><small>Letzte 30 Tage</small></article>
        </section>

        <section className="control-workspace">
          <div className="control-panel control-sites" id="customers">
            <div className="control-panel-head"><div><p className="control-kicker">Portfolio</p><h2>Kundenwebsites</h2></div><button type="button" onClick={() => setNotice("Neue Kundenseite wird im nächsten Schritt über Pracht Control angelegt.")}>+ Website anlegen</button></div>
            <div className="control-site-list">
              {sites.map((site) => <button type="button" key={site.id} className={`control-site ${site.id === selectedId ? "is-selected" : ""}`} onClick={() => setSelectedId(site.id)}>
                <span className="control-site-initial">{site.name.slice(0, 2).toUpperCase()}</span>
                <span className="control-site-name"><b>{site.name}</b><small>{site.domain} · {site.hosting}</small></span>
                <span className={`control-state is-${site.state.toLowerCase().replace("ä", "a")}`}>{site.state}</span>
                <span className="control-chevron">↗</span>
              </button>)}
            </div>
          </div>

          <div className="control-panel control-detail">
            <div className="control-panel-head"><div><p className="control-kicker">Ausgewählt</p><h2>{selectedSite.name}</h2></div><a href={`https://${selectedSite.domain}`} target="_blank" rel="noreferrer">Website öffnen ↗</a></div>
            <div className="control-domain"><span className={`control-state is-${selectedSite.state.toLowerCase().replace("ä", "a")}`}>{selectedSite.state}</span><p>{selectedSite.domain}<small>Zuletzt geprüft: {selectedSite.update}</small></p></div>
            <div className="control-actions"><button type="button" className="is-active" onClick={() => { updateState("Aktiv"); void persistState("Aktiv"); }}>Aktiv</button><button type="button" onClick={() => { updateState("Wartung"); void persistState("Wartung"); }}>Wartung</button><button type="button" className="is-danger" onClick={() => { updateState("404"); void persistState("404"); }}>404-Modus</button></div>
            <p className="control-help">Der spätere Live-Schalter steuert die Kundendomain direkt über das Pracht Gateway. Aktuell ist dies eine sichere Vorschau.</p>
            <div className="control-detail-grid"><div><small>Traffic heute</small><b>{selectedSite.visits}</b><em>+ 12,8 %</em></div><div><small>Kontaktklicks</small><b>24</b><em>+ 4 heute</em></div><div><small>Uptime</small><b>100 %</b><em>30 Tage</em></div></div>
          </div>
        </section>

        <section className="control-command" id="leads">
          <article className="control-panel control-inbox">
            <div className="control-panel-head"><div><p className="control-kicker">Lead Inbox</p><h2>Neue Anfragen</h2></div><span className="control-count">4 offen</span></div>
            <ol className="control-leads">
              <li><span className="control-avatar">SB</span><p><b>Sarah Becker</b><small>CKEVENTCENTER · Kontaktformular</small></p><time>09:18</time></li>
              <li><span className="control-avatar is-orange">MW</span><p><b>Marcel Witte</b><small>E&amp;N Dienstleistung · Rückrufwunsch</small></p><time>Gestern</time></li>
              <li><span className="control-avatar is-dark">NK</span><p><b>Nora Klein</b><small>Urlaub Duhnen · Buchungsanfrage</small></p><time>Gestern</time></li>
            </ol>
            <button type="button" onClick={() => setNotice("Die zentrale Lead-Inbox wird mit dem Panel-Backend verbunden.")}>Alle Anfragen ansehen <b>{"\u2197"}</b></button>
          </article>

          <article className="control-panel control-health">
            <div className="control-panel-head"><div><p className="control-kicker">Website Health</p><h2>Technischer Check</h2></div><span className="control-live"><span></span> 6/6 online</span></div>
            <div className="control-health-score"><strong>96</strong><span>/100</span><p>Portfolio-Score</p></div>
            <ul>
              <li><span>Erreichbarkeit</span><b>100 %</b></li>
              <li><span>SSL-Zertifikate</span><b>6 / 6 gültig</b></li>
              <li><span>Performance</span><b>Sehr gut</b></li>
              <li><span>Offene Warnungen</span><b className="is-warning">2</b></li>
            </ul>
          </article>

          <article className="control-panel control-tools">
            <div className="control-panel-head"><div><p className="control-kicker">Schnellzugriff</p><h2>Control Tools</h2></div></div>
            <button type="button" onClick={() => setNotice("Report-Vorlage für den ausgewählten Kunden vorbereitet.")}><span>01</span> Monatsreport erstellen <b>{"\u2197"}</b></button>
            <button type="button" onClick={() => setNotice("Der Installationsprozess wird mit dem Pracht Control Kit verbunden.")}><span>02</span> Control Kit generieren <b>{"\u2197"}</b></button>
            <button type="button" onClick={() => setNotice("Die geplante Wartungsseite kann im nächsten Schritt gestaltet werden.")}><span>03</span> Wartungsseite bearbeiten <b>{"\u2197"}</b></button>
          </article>
        </section>

        <section className="control-operations">
          <article className="control-panel control-tasks">
            <div className="control-panel-head"><div><p className="control-kicker">Nächste Schritte</p><h2>Offene Aufgaben</h2></div><span>3 diese Woche</span></div>
            <ul>
              <li><button type="button" aria-label="Aufgabe abhaken" onClick={() => setNotice("Aufgabe in der Vorschau als erledigt markiert.")}></button><p><b>CKEVENTCENTER: Google-Unternehmensprofil verknüpfen</b><small>Marketing · heute</small></p><em>Heute</em></li>
              <li><button type="button" aria-label="Aufgabe abhaken" onClick={() => setNotice("Aufgabe in der Vorschau als erledigt markiert.")}></button><p><b>Urlaub Duhnen: Sommer-Kampagne vorbereiten</b><small>Content · diese Woche</small></p><em>12. Aug.</em></li>
              <li><button type="button" aria-label="Aufgabe abhaken" onClick={() => setNotice("Aufgabe in der Vorschau als erledigt markiert.")}></button><p><b>E&amp;N: Kundenportal-Update testen</b><small>Technik · diese Woche</small></p><em>14. Aug.</em></li>
            </ul>
          </article>

          <article className="control-panel control-kit">
            <p className="control-kicker">Pracht Control Kit</p>
            <h2>Neue Website?<br /><em>In Minuten verbunden.</em></h2>
            <p>Beim echten Start erzeugt das Panel eine Kunden-ID, eine Konfigurationsdatei und deine Codex-Installationsanweisung.</p>
            <div><span>1</span><i></i><span>2</span><i></i><span>3</span></div>
            <small>Kunde anlegen <b>{"\u2192"}</b> Codex einbauen lassen <b>{"\u2192"}</b> kontrollieren</small>
          </article>
        </section>

        <section className="control-lower">
          <article className="control-panel control-traffic" id="traffic"><div className="control-panel-head"><div><p className="control-kicker">Reichweite</p><h2>Traffic im Überblick</h2></div><span>Letzte 30 Tage</span></div><div className="control-chart" aria-label="Beispielhafte Besucherentwicklung">{trafficBars.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="control-chart-labels"><span>01. Jul</span><span>10. Jul</span><span>20. Jul</span><span>Heute</span></div></article>
          <article className="control-panel control-activity" id="activity"><div className="control-panel-head"><div><p className="control-kicker">Protokoll</p><h2>Letzte Aktivität</h2></div><span className="control-live"><span></span> Live</span></div><ol>{logs.map((log) => <li key={log}>{log}</li>)}</ol><button type="button" onClick={() => setNotice("Das vollständige Änderungsprotokoll folgt mit dem echten Panel-Backend.")}>Ganzes Protokoll ansehen <b>↗</b></button></article>
        </section>
      </section>
    </main>
  );
}
