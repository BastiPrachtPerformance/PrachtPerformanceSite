import { getStore } from "@netlify/blobs";
import { randomBytes } from "node:crypto";

export type SiteState = "Aktiv" | "Wartung" | "404";
export type ConnectionState = "Nicht verbunden" | "Verbunden";
export type ControlEvent = "page_view" | "contact_click" | "form_submit";
export type TaskStatus = "offen" | "in Arbeit" | "wartet auf Kunde" | "erledigt";
export type TaskPriority = "niedrig" | "normal" | "dringend";

export type TrafficPoint = { date: string; pageViews: number; contactClicks: number; formSubmissions: number };
export type ControlTask = { id: string; siteId: string; title: string; category: string; priority: TaskPriority; status: TaskStatus; dueDate: string; notes: string; createdAt: string; completedAt?: string };
export type ControlReport = { id: string; siteId: string; period: string; createdAt: string; pageViews: number; contacts: number; conversion: number };
export type AuditEntry = { id: string; createdAt: string; siteId?: string; text: string; kind: "status" | "task" | "website" | "report" | "system" };

export type ControlSite = {
  id: string; name: string; domain: string; hosting: string; state: SiteState; connection: ConnectionState; update: string; createdAt: string; controlToken: string;
  industry?: string; contactName?: string; contactEmail?: string; contactPhone?: string; productionDomain?: string; stagingDomain?: string; repositoryUrl?: string; hostingUrl?: string;
  projectStatus?: "laufend" | "abgeschlossen" | "pausiert"; services?: string[]; supportPlan?: string; notes?: string;
  scheduledState?: SiteState; scheduledAt?: string; scheduledReason?: string;
};

export type ControlData = { schemaVersion: 3; sites: ControlSite[]; logs: string[]; analytics: Record<string, TrafficPoint[]>; tasks: ControlTask[]; reports: ControlReport[]; audit: AuditEntry[]; updatedAt: string };

function createToken() { return randomBytes(24).toString("base64url"); }
function createId(prefix: string) { return `${prefix}-${randomBytes(6).toString("hex")}`; }
function now() { return new Date().toISOString(); }

function createSeed(): ControlData {
  return { schemaVersion: 3, sites: [], logs: ["Pracht Control ist bereit. Lege jetzt die erste Kundenwebsite an."], analytics: {}, tasks: [], reports: [], audit: [{ id: createId("audit"), createdAt: now(), text: "Pracht Control wurde gestartet", kind: "system" }], updatedAt: now() };
}

function store() { return getStore({ name: "pracht-control", consistency: "strong" }); }

function isOldData(value: unknown): value is { sites: ControlSite[]; logs: string[]; analytics: Record<string, TrafficPoint[]> } {
  return Boolean(value && typeof value === "object" && Array.isArray((value as { sites?: unknown }).sites) && (value as { analytics?: unknown }).analytics);
}

function upgrade(value: unknown): ControlData | null {
  if (!isOldData(value)) return null;
  const old = value as Partial<ControlData>;
  if (old.schemaVersion === 3) return old as ControlData;
  const migrated: ControlData = { schemaVersion: 3, sites: old.sites ?? [], logs: old.logs ?? [], analytics: old.analytics ?? {}, tasks: old.tasks ?? [], reports: old.reports ?? [], audit: old.audit ?? [], updatedAt: now() };
  if (!migrated.audit.length) migrated.audit.push({ id: createId("audit"), createdAt: now(), text: "Control-Daten auf Version 3 erweitert", kind: "system" });
  return migrated;
}

export async function getControlData() {
  const saved = await store().get("dashboard", { type: "json", consistency: "strong" });
  const data = upgrade(saved);
  if (data) { applyScheduledStates(data); if ((saved as Partial<ControlData> | null)?.schemaVersion !== 3) await saveControlData(data); return data; }
  const next = createSeed(); await store().setJSON("dashboard", next); return next;
}

export async function saveControlData(data: ControlData) { const next = { ...data, updatedAt: now() }; await store().setJSON("dashboard", next); return next; }

export function logActivity(data: ControlData, text: string, kind: AuditEntry["kind"] = "system", siteId?: string) {
  data.logs = [text, ...data.logs].slice(0, 80); data.audit = [{ id: createId("audit"), createdAt: now(), siteId, text, kind }, ...data.audit].slice(0, 250);
}

export function createSite(data: ControlData, input: { name: string; domain: string; hosting?: string }) {
  const domain = input.domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const baseId = domain.replace(/^www\./, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "kunde";
  let id = baseId; let index = 2; while (data.sites.some((site) => site.id === id)) id = `${baseId}-${index++}`;
  const site: ControlSite = { id, name: input.name.trim(), domain, hosting: input.hosting?.trim() || "Netlify", state: "Aktiv", connection: "Nicht verbunden", update: "Control Kit noch nicht installiert", createdAt: now(), controlToken: createToken(), projectStatus: "laufend", services: ["Website"], productionDomain: domain, supportPlan: "Individuell" };
  data.sites.push(site); data.analytics[site.id] = []; logActivity(data, `${site.name} als Kundenwebsite angelegt`, "website", site.id); return site;
}

export function updateSite(data: ControlData, siteId: string, fields: Partial<ControlSite>) {
  const site = data.sites.find((entry) => entry.id === siteId); if (!site) return null;
  const safe: (keyof ControlSite)[] = ["name", "domain", "hosting", "industry", "contactName", "contactEmail", "contactPhone", "productionDomain", "stagingDomain", "repositoryUrl", "hostingUrl", "projectStatus", "services", "supportPlan", "notes", "scheduledState", "scheduledAt", "scheduledReason"];
  safe.forEach((key) => { if (fields[key] !== undefined) (site[key] as never) = fields[key] as never; });
  site.update = "Kundenakte gerade aktualisiert"; logActivity(data, `${site.name}: Kundenakte aktualisiert`, "website", site.id); return site;
}

export function applyScheduledStates(data: ControlData) {
  const current = Date.now();
  data.sites.forEach((site) => {
    if (!site.scheduledState || !site.scheduledAt || new Date(site.scheduledAt).getTime() > current) return;
    site.state = site.scheduledState; site.update = `Automatisch geschaltet: ${site.scheduledState}`;
    logActivity(data, `${site.name}: automatisch auf ${site.scheduledState} geschaltet`, "status", site.id);
    delete site.scheduledState; delete site.scheduledAt; delete site.scheduledReason;
  });
}

export function trafficForSite(data: ControlData, siteId: string, days = 30) {
  const from = new Date(); from.setUTCDate(from.getUTCDate() - (days - 1));
  const entries = new Map((data.analytics[siteId] ?? []).map((entry) => [entry.date, entry]));
  return Array.from({ length: days }, (_, index) => { const date = new Date(from); date.setUTCDate(from.getUTCDate() + index); const key = date.toISOString().slice(0, 10); return entries.get(key) ?? { date: key, pageViews: 0, contactClicks: 0, formSubmissions: 0 }; });
}

export function addControlEvent(data: ControlData, siteId: string, event: ControlEvent) {
  const date = new Date().toISOString().slice(0, 10); const entries = data.analytics[siteId] ?? []; let point = entries.find((entry) => entry.date === date);
  if (!point) { point = { date, pageViews: 0, contactClicks: 0, formSubmissions: 0 }; entries.push(point); }
  if (event === "page_view") point.pageViews += 1; if (event === "contact_click") point.contactClicks += 1; if (event === "form_submit") point.formSubmissions += 1;
  data.analytics[siteId] = entries.slice(-180);
}

export function createTask(data: ControlData, input: Omit<ControlTask, "id" | "createdAt" | "completedAt" | "status"> & { status?: TaskStatus }) {
  const task: ControlTask = { id: createId("task"), title: input.title.trim(), siteId: input.siteId, category: input.category || "Website", priority: input.priority || "normal", status: input.status || "offen", dueDate: input.dueDate, notes: input.notes || "", createdAt: now() };
  data.tasks.unshift(task); const site = data.sites.find((entry) => entry.id === task.siteId); logActivity(data, `${site?.name ?? "Kunde"}: Aufgabe „${task.title}“ angelegt`, "task", task.siteId); return task;
}

export function updateTask(data: ControlData, taskId: string, fields: Partial<ControlTask>) {
  const task = data.tasks.find((entry) => entry.id === taskId); if (!task) return null;
  if (fields.status) { task.status = fields.status; task.completedAt = fields.status === "erledigt" ? now() : undefined; }
  if (fields.priority) task.priority = fields.priority; if (fields.dueDate !== undefined) task.dueDate = fields.dueDate; if (fields.notes !== undefined) task.notes = fields.notes; if (fields.title) task.title = fields.title;
  const site = data.sites.find((entry) => entry.id === task.siteId); logActivity(data, `${site?.name ?? "Kunde"}: Aufgabe „${task.title}“ auf ${task.status} gesetzt`, "task", task.siteId); return task;
}

export function createReport(data: ControlData, siteId: string, period = "Letzte 30 Tage") {
  const traffic = trafficForSite(data, siteId, 30); const pageViews = traffic.reduce((total, point) => total + point.pageViews, 0); const contacts = traffic.reduce((total, point) => total + point.contactClicks + point.formSubmissions, 0);
  const report: ControlReport = { id: createId("report"), siteId, period, createdAt: now(), pageViews, contacts, conversion: pageViews ? Math.round((contacts / pageViews) * 1000) / 10 : 0 };
  data.reports.unshift(report); const site = data.sites.find((entry) => entry.id === siteId); logActivity(data, `${site?.name ?? "Kunde"}: Monatsreport erstellt`, "report", siteId); return report;
}
