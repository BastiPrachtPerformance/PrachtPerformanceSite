import { getControlData } from "../lib/control-data";

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } });

export default async (request: Request) => {
  const url = new URL(request.url);
  const siteId = url.searchParams.get("siteId") ?? "";
  const token = request.headers.get("x-pracht-control-token") ?? "";
  const site = (await getControlData()).sites.find((entry) => entry.id === siteId);
  if (!site || !token || token !== site.controlToken) return json({ error: "Nicht autorisiert." }, 401);
  return json({ state: site.state, domain: site.domain, updatedAt: site.update });
};

export const config = { path: "/api/control-status" };
