import { addControlEvent, getControlData, saveControlData, type ControlEvent } from "../lib/control-data";

const allowedEvents: ControlEvent[] = ["page_view", "contact_click", "form_submit"];

function response(body: unknown, origin: string | null, status = 200) {
  const headers = new Headers({ "cache-control": "no-store", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type" });
  if (origin) headers.set("access-control-allow-origin", origin);
  return Response.json(body, { status, headers });
}

function originMatches(origin: string | null, domain: string) {
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname.toLowerCase();
    const cleanDomain = domain.toLowerCase().replace(/^www\./, "");
    return host === cleanDomain || host === `www.${cleanDomain}`;
  } catch {
    return false;
  }
}

export default async (request: Request) => {
  const origin = request.headers.get("origin");
  if (request.method === "OPTIONS") return response({ ok: true }, origin);
  if (request.method !== "POST") return response({ error: "Methode nicht erlaubt" }, null, 405);

  const body = await request.json().catch(() => null) as { siteId?: string; event?: ControlEvent } | null;
  if (!body?.siteId || !body.event || !allowedEvents.includes(body.event)) return response({ error: "Ungültiges Event." }, null, 400);
  const data = await getControlData();
  const site = data.sites.find((entry) => entry.id === body.siteId);
  if (!site || !originMatches(origin, site.domain)) return response({ error: "Nicht autorisiert." }, null, 401);

  addControlEvent(data, site.id, body.event);
  if (site.connection !== "Verbunden") {
    site.connection = "Verbunden";
    site.update = "Control Kit verbindet sich";
    data.logs = [`${site.name}: erste Live-Daten empfangen`, ...data.logs].slice(0, 50);
  }
  await saveControlData(data);
  return response({ ok: true }, origin, 202);
};

export const config = { path: "/api/control-event" };
