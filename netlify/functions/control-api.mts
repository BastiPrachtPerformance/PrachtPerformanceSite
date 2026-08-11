import { createSite, getControlData, saveControlData, type SiteState } from "../lib/control-data";
import { hasControlSession } from "../lib/control-auth";

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } });
const validStates: SiteState[] = ["Aktiv", "Wartung", "404"];

export default async (request: Request) => {
  if (!hasControlSession(request)) return json({ error: "Nicht angemeldet." }, 401);

  if (request.method === "GET") return json(await getControlData());
  if (request.method !== "POST") return json({ error: "Methode nicht erlaubt" }, 405);

  const body = await request.json().catch(() => null) as { action?: string; siteId?: string; state?: SiteState; name?: string; domain?: string; hosting?: string } | null;
  if (!body?.action) return json({ error: "Aktion fehlt." }, 400);
  const data = await getControlData();

  if (body.action === "set-site-state") {
    if (!body.siteId || !body.state || !validStates.includes(body.state)) return json({ error: "Ungültige Website oder Status." }, 400);
    const site = data.sites.find((entry) => entry.id === body.siteId);
    if (!site) return json({ error: "Website nicht gefunden." }, 404);
    site.state = body.state;
    site.update = "Status gerade geändert";
    data.logs = [`${site.name}: Status ${body.state} gesetzt`, ...data.logs].slice(0, 50);
    return json(await saveControlData(data));
  }

  if (body.action === "create-site") {
    if (!body.name?.trim() || !body.domain?.trim()) return json({ error: "Name und Domain werden benötigt." }, 400);
    const normalizedDomain = body.domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(normalizedDomain)) return json({ error: "Bitte eine gültige Domain angeben." }, 400);
    if (data.sites.some((site) => site.domain === normalizedDomain)) return json({ error: "Diese Domain ist bereits angelegt." }, 409);
    const site = createSite(data, { name: body.name, domain: normalizedDomain, hosting: body.hosting });
    await saveControlData(data);
    return json({ data, site });
  }

  return json({ error: "Unbekannte Aktion." }, 400);
};

export const config = { path: "/api/control" };
