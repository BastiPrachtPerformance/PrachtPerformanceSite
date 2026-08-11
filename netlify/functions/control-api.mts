import { applyScheduledStates, createReport, createSite, createTask, getControlData, logActivity, saveControlData, updateSite, updateTask, type ControlSite, type SiteState, type TaskPriority, type TaskStatus } from "../lib/control-data";
import { hasControlSession } from "../lib/control-auth";

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } });
const validStates: SiteState[] = ["Aktiv", "Wartung", "404"];
const validTaskStates: TaskStatus[] = ["offen", "in Arbeit", "wartet auf Kunde", "erledigt"];
const validPriorities: TaskPriority[] = ["niedrig", "normal", "dringend"];

export default async (request: Request) => {
  if (!hasControlSession(request)) return json({ error: "Nicht angemeldet." }, 401);
  const data = await getControlData(); applyScheduledStates(data);
  if (request.method === "GET") return json(await saveControlData(data));
  if (request.method !== "POST") return json({ error: "Methode nicht erlaubt" }, 405);
  const body = await request.json().catch(() => null) as { action?: string; siteId?: string; state?: SiteState; name?: string; domain?: string; hosting?: string; fields?: Partial<ControlSite>; taskId?: string; title?: string; category?: string; priority?: TaskPriority; status?: TaskStatus; dueDate?: string; notes?: string; scheduledAt?: string; scheduledState?: SiteState; scheduledReason?: string } | null;
  if (!body?.action) return json({ error: "Aktion fehlt." }, 400);
  if (body.action === "set-site-state") {
    if (!body.siteId || !body.state || !validStates.includes(body.state)) return json({ error: "Ungültige Website oder Status." }, 400);
    const site = data.sites.find((entry) => entry.id === body.siteId); if (!site) return json({ error: "Website nicht gefunden." }, 404);
    site.state = body.state; site.update = "Status gerade geändert"; delete site.scheduledState; delete site.scheduledAt; delete site.scheduledReason; logActivity(data, `${site.name}: Status ${body.state} gesetzt`, "status", site.id); return json(await saveControlData(data));
  }
  if (body.action === "schedule-site-state") {
    if (!body.siteId || !body.scheduledState || !validStates.includes(body.scheduledState) || !body.scheduledAt || Number.isNaN(new Date(body.scheduledAt).getTime())) return json({ error: "Zeitsteuerung unvollständig." }, 400);
    const site = data.sites.find((entry) => entry.id === body.siteId); if (!site) return json({ error: "Website nicht gefunden." }, 404);
    site.scheduledState = body.scheduledState; site.scheduledAt = body.scheduledAt; site.scheduledReason = body.scheduledReason?.slice(0, 220) || ""; site.update = "Zeitsteuerung geplant"; logActivity(data, `${site.name}: ${body.scheduledState} für ${new Date(body.scheduledAt).toLocaleString("de-DE")} geplant`, "status", site.id); return json(await saveControlData(data));
  }
  if (body.action === "create-site") {
    if (!body.name?.trim() || !body.domain?.trim()) return json({ error: "Name und Domain werden benötigt." }, 400);
    const normalizedDomain = body.domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(normalizedDomain)) return json({ error: "Bitte eine gültige Domain angeben." }, 400);
    if (data.sites.some((site) => site.domain === normalizedDomain)) return json({ error: "Diese Domain ist bereits angelegt." }, 409);
    const site = createSite(data, { name: body.name, domain: normalizedDomain, hosting: body.hosting }); await saveControlData(data); return json({ data, site });
  }
  if (body.action === "update-site") { if (!body.siteId || !body.fields) return json({ error: "Kundenakte unvollständig." }, 400); const site = updateSite(data, body.siteId, body.fields); if (!site) return json({ error: "Website nicht gefunden." }, 404); return json(await saveControlData(data)); }
  if (body.action === "create-task") { if (!body.siteId || !body.title?.trim()) return json({ error: "Kunde und Titel werden benötigt." }, 400); if (body.priority && !validPriorities.includes(body.priority)) return json({ error: "Ungültige Priorität." }, 400); const task = createTask(data, { siteId: body.siteId, title: body.title, category: body.category ?? "Website", priority: body.priority ?? "normal", dueDate: body.dueDate ?? "", notes: body.notes ?? "" }); return json({ data: await saveControlData(data), task }); }
  if (body.action === "update-task") { if (!body.taskId) return json({ error: "Aufgabe fehlt." }, 400); if (body.status && !validTaskStates.includes(body.status)) return json({ error: "Ungültiger Status." }, 400); const task = updateTask(data, body.taskId, { status: body.status, priority: body.priority, dueDate: body.dueDate, notes: body.notes, title: body.title }); if (!task) return json({ error: "Aufgabe nicht gefunden." }, 404); return json(await saveControlData(data)); }
  if (body.action === "create-report") { if (!body.siteId) return json({ error: "Website fehlt." }, 400); const report = createReport(data, body.siteId); return json({ data: await saveControlData(data), report }); }
  return json({ error: "Unbekannte Aktion." }, 400);
};
export const config = { path: "/api/control" };
