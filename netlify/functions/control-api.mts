import { getControlData, saveControlData, type SiteState } from "../lib/control-data";
import { hasControlSession } from "../lib/control-auth";

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } });
const validStates: SiteState[] = ["Aktiv", "Wartung", "404"];

export default async (request: Request) => {
  if (!hasControlSession(request)) return json({ error: "Nicht angemeldet." }, 401);

  if (request.method === "GET") return json(await getControlData());
  if (request.method !== "POST") return json({ error: "Methode nicht erlaubt" }, 405);

  const body = await request.json().catch(() => null) as { action?: string; siteId?: string; state?: SiteState } | null;
  if (!body?.action) return json({ error: "Aktion fehlt." }, 400);
  const data = await getControlData();

  if (body.action === "set-site-state") {
    if (!body.siteId || !body.state || !validStates.includes(body.state)) return json({ error: "Ungültige Website oder Status." }, 400);
    const site = data.sites.find((entry) => entry.id === body.siteId);
    if (!site) return json({ error: "Website nicht gefunden." }, 404);
    site.state = body.state;
    site.update = "Gerade eben";
    data.logs = [`Gerade eben · ${site.name}: Status ${body.state} gesetzt`, ...data.logs].slice(0, 50);
    return json(await saveControlData(data));
  }

  return json({ error: "Unbekannte Aktion." }, 400);
};

export const config = { path: "/api/control" };
