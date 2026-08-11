"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type SiteState = "Aktiv" | "Wartung" | "404";
type ConnectionState = "Nicht verbunden" | "Verbunden";
type TrafficPoint = { date: string; pageViews: number; contactClicks: number; formSubmissions: number };
type Site = { id: string; name: string; domain: string; hosting: string; state: SiteState; connection: ConnectionState; update: string; createdAt: string; controlToken: string };
type DashboardData = { sites?: Site[]; logs?: string[]; analytics?: Record<string, TrafficPoint[]> };

const number = new Intl.NumberFormat("de-DE");

function last30Days(history: TrafficPoint[]) {
  const known = new Map(history.map((point) => [point.date, point]));
  const now = new Date();
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 29 + index));
    const key = date.toISOString().slice(0, 10);
    return known.get(key) ?? { date: key, pageViews: 0, contactClicks: 0, formSubmissions: 0 };
  });
}

function stateClass(state: SiteState) {
  return state === "Wartung" ? "is-wartung" : state === "404" ? "is-404" : "";
}

export default function ControlPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, TrafficPoint[]>>({});
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState("ckeventcenter");
  const [notice, setNotice] = useState("Live-Control ist bereit. Verbinde die erste Website über das Control Kit.");
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "guest">("loading");
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [showCreateSite, setShowCreateSite] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadDashboard() {
    const response = await fetch("/api/control", { credentials: "same-origin" });
    if (!response.ok) return;
    const data = await response.json() as DashboardData;
    if (data.sites) setSites(data.sites);
    if (data.logs) setLogs(data.logs);
    if (data.analytics) setAnalytics(data.analytics);
  }

  useEffect(() => {
    fetch("/api/control-auth", { credentials: "same-origin" })
      .then(async (response) => ({ data: await response.json() as { authenticated?: boolean; configured?: boolean } }))
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

  async function logout() {
    await fetch("/api/control-auth?action=logout", { method: "POST", credentials: "same-origin" });
    setAuthState("guest");
  }

  const selectedSite = useMemo(() => sites.find((site) => site.id === selectedId) ?? sites[0], [selectedId, sites]);
  const connectedCount = sites.filter((site) => site.connection === "Verbunden").length;
  const onlineCount = sites.filter((site) => site.state === "Aktiv").length;
  const totalTraffic = Object.values(analytics).flat().reduce((sum, point) => sum + point.pageViews, 0);
  const totalContacts = Object.values(analytics).flat().reduce((sum, point) => sum + point.contactClicks + point.formSubmissions, 0);
  const selectedTraffic = last30Days(selectedSite ? analytics[selectedSite.id] ?? [] : []);
  const selectedViews = selectedTraffic.reduce((sum, point) => sum + point.pageViews, 0);
  const selectedContacts = selectedTraffic.reduce((sum, point) => sum + point.contactClicks + point.formSubmissions, 0);
  const maximumTraffic = Math.max(...selectedTraffic.map((point) => point.pageViews), 1);

  async function persistState(state: SiteState) {
    if (!selectedSite) return;
    const response = await fetch("/api/control", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "set-site-state", siteId: selectedSite.id, state }) });
    const data = await response.json().catch(() => null) as DashboardData | null;
    if (!response.ok || !data) {
      setNotice("Der Status konnte gerade nicht gespeichert werden.");
      return;
    }
    if (data.sites) setSites(data.sites);
    if (data.logs) setLogs(data.logs);
    if (data.analytics) setAnalytics(data.analytics);
    setNotice(selectedSite.connection === "Verbunden" ? `${selectedSite.name}: Status live auf ${state} gesetzt.` : `${selectedSite.name}: Status gespeichert. Er greift live, sobald das Control Kit installiert ist.`);
  }

  async function submitNewSite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setCreateMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/control", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "create-site", name: form.get("name"), domain: form.get("domain"), hosting: form.get("hosting") }) });
    const result = await response.json() as { error?: string; data?: DashboardData; site?: Site };
    setCreating(false);
    if (!response.ok || !result.data || !result.site) {
      setCreateMessage(result.error ?? "Kundenwebsite konnte nicht angelegt werden.");
      return;
    }
    if (result.data.sites) setSites(result.data.sites);
    if (result.data.logs) setLogs(result.data.logs);
    if (result.data.analytics) setAnalytics(result.data.analytics);
    setSelectedId(result.site.id);
    setShowCreateSite(false);
    setNotice(`${result.site.name} wurde angelegt. Das Control Kit kann jetzt eingebaut werden.`);
  }

  function copyKit() {
    if (!selectedSite) return;
    const kit = `PRACHT_CONTROL_URL=${window.location.origin}\nPRACHT_CONTROL_SITE_ID=${selectedSite.id}\nPRACHT_CONTROL_TOKEN=${selectedSite.controlToken}`;
    void navigator.clipboard.writeText(kit);
    setNotice("Die Control-Variablen wurden kopiert. Sie gehören ausschließlich in die Netlify-Umgebungsvariablen der Kundenwebsite.");
  }

  if (authState !== "authenticated") {
    return <main className="control-login-shell"><section className="control-login-card"><a className="control-brand" href="/"><img src="/preview.png" alt="Pracht Performance" /><b>PRACHT<br />CONTROL</b></a><p className="control-kicker">Geschützter Bereich</p><h1>Die Steuerung<br /><em>gehört dir.</em></h1><p>Bitte melde dich an, um Kundenwebsites, Traffic und Status zentral zu verwalten.</p><form onSubmit={submitLogin}><label htmlFor="control-password">Passwort</label><input id="control-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required disabled={authState === "loading"} /><button type="submit" disabled={authState === "loading"}>{authState === "loading" ? "Verbindung wird geprüft" : "Control öffnen"} <span>↗</span></button></form>{loginMessage && <small className="control-login-message">{loginMessage}</small>}</section></main>;
  }

  if (!selectedSite) return <main className="control-shell"><aside className="control-sidebar"><a className="control-brand" href="/" aria-label="Zur Pracht Performance Startseite"><span>P</span><b>PRACHT<br />CONTROL</b></a><div className="control-account"><span>BP</span><p><b>Bastian Pracht</b><small>Administrator</small></p><button type="button" aria-label="Abmelden" onClick={() => void logout()}>Aus</button></div></aside><section className="control-main control-empty-main"><p className="control-kicker">Pracht Control / Live</p><h1>Dein Portfolio<br /><em>startet hier.</em></h1><p>Es sind noch keine Kundenwebsites angelegt. Lege die erste echte Website an – anschließend erhält sie ihr eigenes Control Kit für Live-Status und Traffic.</p><button type="button" onClick={() => { setCreateMessage(""); setShowCreateSite(true); }}>Erste Website anlegen <span>↗</span></button>{showCreateSite && <div className="control-modal" role="dialog" aria-modal="true" aria-labelledby="new-site-heading"><form className="control-modal-card" onSubmit={submitNewSite}><button className="control-modal-close" type="button" aria-label="Dialog schließen" onClick={() => setShowCreateSite(false)}>×</button><p className="control-kicker">Neuer Kunde</p><h2 id="new-site-heading">Website anlegen.</h2><label>Name<input name="name" placeholder="z. B. Musterfirma GmbH" required /></label><label>Domain<input name="domain" placeholder="musterfirma.de" inputMode="url" required /></label><label>Hosting<input name="hosting" defaultValue="Netlify" /></label>{createMessage && <small className="control-login-message">{createMessage}</small>}<button type="submit" disabled={creating}>{creating ? "Wird angelegt" : "Website anlegen"} <span>↗</span></button></form></div>}</section></main>;

  return <main className="control-shell">
    <aside className="control-sidebar">
      <a className="control-brand" href="/" aria-label="Zur Pracht Performance Startseite"><span>P</span><b>PRACHT<br />CONTROL</b></a>
      <nav className="control-nav" aria-label="Control Navigation"><a className="is-active" href="#overview"><i>01</i> Übersicht</a><a href="#customers"><i>02</i> Kunden</a><a href="#traffic"><i>03</i> Traffic</a><a href="#activity"><i>04</i> Aktivität</a></nav>
      <div className="control-account"><span>BP</span><p><b>Bastian Pracht</b><small>Administrator</small></p><button type="button" aria-label="Abmelden" onClick={() => void logout()}>Aus</button></div>
    </aside>
    <section className="control-main" id="overview">
      <header className="control-topbar"><div><p className="control-kicker">Pracht Control / Live</p><h1>Guten Morgen,<br /><em>Bastian.</em></h1></div><div className="control-live"><span></span> Zentrale erreichbar</div></header>
      <div className="control-preview">{notice}<b>LIVE</b></div>
      <section className="control-metrics" aria-label="Übersicht Kennzahlen">
        <article><p>Betreute Websites</p><strong>{sites.length}</strong><small>{connectedCount} mit Control Kit verbunden</small></article>
        <article><p>Aktiv geschaltet</p><strong>{onlineCount}<i>/{sites.length}</i></strong><small>Status kommt direkt aus Control</small></article>
        <article><p>Besuche / 30 Tage</p><strong>{number.format(totalTraffic)}</strong><small>{connectedCount ? "Echte Daten der verbundenen Websites" : "Noch keine Website verbunden"}</small></article>
        <article><p>Kontakt-Events</p><strong>{number.format(totalContacts)}</strong><small>Telefon, E-Mail, WhatsApp & Formulare</small></article>
      </section>
      <section className="control-workspace">
        <div className="control-panel control-sites" id="customers"><div className="control-panel-head"><div><p className="control-kicker">Portfolio</p><h2>Kundenwebsites</h2></div><button type="button" onClick={() => { setCreateMessage(""); setShowCreateSite(true); }}>+ Website anlegen</button></div><div className="control-site-list">{sites.map((site) => <button type="button" key={site.id} className={`control-site ${site.id === selectedId ? "is-selected" : ""}`} onClick={() => setSelectedId(site.id)}><span className="control-site-initial">{site.name.slice(0, 2).toUpperCase()}</span><span className="control-site-name"><b>{site.name}</b><small>{site.domain} · {site.hosting}</small></span><span className={`control-state ${site.connection === "Verbunden" ? "" : "is-disconnected"}`}>{site.connection}</span></button>)}</div></div>
        <div className="control-panel control-detail"><div className="control-panel-head"><div><p className="control-kicker">Ausgewählt</p><h2>{selectedSite.name}</h2></div><a href={`https://${selectedSite.domain}`} target="_blank" rel="noreferrer">Website öffnen ↗</a></div><div className="control-domain"><span className={`control-state ${stateClass(selectedSite.state)}`}>{selectedSite.state}</span><p>{selectedSite.domain}<small>{selectedSite.connection} · {selectedSite.update}</small></p></div><div className="control-actions"><button type="button" className={selectedSite.state === "Aktiv" ? "is-active" : ""} onClick={() => void persistState("Aktiv")}>Aktiv</button><button type="button" className={selectedSite.state === "Wartung" ? "is-active" : ""} onClick={() => void persistState("Wartung")}>Wartung</button><button type="button" className={`is-danger ${selectedSite.state === "404" ? "is-active" : ""}`} onClick={() => void persistState("404")}>404-Modus</button></div><p className="control-help">{selectedSite.connection === "Verbunden" ? "Der Status greift live auf der Kundendomain." : "Noch nicht live verbunden: Status wird bereits gespeichert und greift nach dem Einbau des Control Kits automatisch."}</p><div className="control-detail-grid"><div><small>Besuche / 30 Tage</small><b>{number.format(selectedViews)}</b><em>{selectedSite.connection === "Verbunden" ? "Live erfasst" : "Noch keine Daten"}</em></div><div><small>Kontakt-Events</small><b>{number.format(selectedContacts)}</b><em>Live erfasst</em></div><div><small>Control Kit</small><b>{selectedSite.connection === "Verbunden" ? "Live" : "Offen"}</b><em>{selectedSite.connection}</em></div></div></div>
      </section>
      <section className="control-command">
        <article className="control-panel control-kit"><p className="control-kicker">Pracht Control Kit</p><h2>{selectedSite.connection === "Verbunden" ? <>Verbunden.<br /><em>Alles im Blick.</em></> : <>Diese Website<br /><em>jetzt verbinden.</em></>}</h2><p>Das Kit liefert Status, Traffic und Kontakt-Events zentral an Pracht Control. Der echte 404-Modus wird über den Netlify Edge Adapter ausgeliefert.</p><div><span>1</span><i></i><span>2</span><i></i><span>3</span></div><small>Variablen kopieren <b>→</b> Adapter einbauen <b>→</b> deployen</small><button type="button" className="control-kit-copy" onClick={copyKit}>Control-Variablen kopieren <b>↗</b></button></article>
        <article className="control-panel control-health"><div className="control-panel-head"><div><p className="control-kicker">Verbindungs-Check</p><h2>Live-Status</h2></div><span className="control-live"><span></span> {connectedCount}/{sites.length} verbunden</span></div><div className="control-health-score"><strong>{connectedCount}</strong><span>/ {sites.length}</span><p>Websites mit Live-Control</p></div><ul><li><span>Status-Steuerung</span><b>{selectedSite.connection === "Verbunden" ? "Live" : "Bereit"}</b></li><li><span>Traffic-Erfassung</span><b>{selectedSite.connection === "Verbunden" ? "Live" : "Offen"}</b></li><li><span>404-Killswitch</span><b>{selectedSite.connection === "Verbunden" ? "Aktiv" : "Adapter fehlt"}</b></li><li><span>Erfundene Daten</span><b>Keine</b></li></ul></article>
        <article className="control-panel control-tools"><div className="control-panel-head"><div><p className="control-kicker">Schnellzugriff</p><h2>Control Tools</h2></div></div><button type="button" onClick={copyKit}><span>01</span> Control Kit kopieren <b>↗</b></button><button type="button" onClick={() => setNotice("Für die erste Live-Anbindung bauen wir jetzt den Adapter direkt in die Kundenwebsite ein.")}><span>02</span> Erste Website verbinden <b>↗</b></button><button type="button" onClick={() => void loadDashboard()}><span>03</span> Live-Daten aktualisieren <b>↗</b></button></article>
      </section>
      <section className="control-lower"><article className="control-panel control-traffic" id="traffic"><div className="control-panel-head"><div><p className="control-kicker">Reichweite</p><h2>{selectedSite.name}: Traffic</h2></div><span>Letzte 30 Tage</span></div><div className={`control-chart ${selectedViews === 0 ? "is-empty" : ""}`} aria-label="Besucherentwicklung der letzten 30 Tage">{selectedTraffic.map((point) => <i key={point.date} style={{ height: `${point.pageViews ? Math.max(8, (point.pageViews / maximumTraffic) * 100) : 2}%` }} />)}</div><div className="control-chart-labels"><span>vor 30 Tagen</span><span>{selectedViews ? `${number.format(selectedViews)} Besuche` : "Noch keine Live-Daten"}</span><span>heute</span></div></article><article className="control-panel control-activity" id="activity"><div className="control-panel-head"><div><p className="control-kicker">Protokoll</p><h2>Letzte Aktivität</h2></div><span className="control-live"><span></span> Live</span></div><ol>{logs.length ? logs.slice(0, 4).map((log, index) => <li key={`${log}-${index}`}>{log}</li>) : <li>Noch keine Aktivität.</li>}</ol><button type="button" onClick={() => void loadDashboard()}>Aktualisieren <b>↗</b></button></article></section>
    </section>
    {showCreateSite && <div className="control-modal" role="dialog" aria-modal="true" aria-labelledby="new-site-heading"><form className="control-modal-card" onSubmit={submitNewSite}><button className="control-modal-close" type="button" aria-label="Dialog schließen" onClick={() => setShowCreateSite(false)}>×</button><p className="control-kicker">Neuer Kunde</p><h2 id="new-site-heading">Website anlegen.</h2><label>Name<input name="name" placeholder="z. B. Musterfirma GmbH" required /></label><label>Domain<input name="domain" placeholder="musterfirma.de" inputMode="url" required /></label><label>Hosting<input name="hosting" defaultValue="Netlify" /></label>{createMessage && <small className="control-login-message">{createMessage}</small>}<button type="submit" disabled={creating}>{creating ? "Wird angelegt" : "Website anlegen"} <span>↗</span></button></form></div>}
  </main>;
}
