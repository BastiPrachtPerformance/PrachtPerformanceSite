import { getControlData } from "../lib/control-data";

function cleanDomain(value: string) {
  return value.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

function originMatches(origin: string | null, domain: string) {
  if (!origin) return false;
  try {
    return cleanDomain(new URL(origin).hostname) === cleanDomain(domain);
  } catch {
    return false;
  }
}

export default async (request: Request) => {
  const url = new URL(request.url);
  const domain = cleanDomain(url.searchParams.get("domain") ?? "");
  const site = (await getControlData()).sites.find((entry) => cleanDomain(entry.domain) === domain);
  if (!site) return Response.json({ error: "Website nicht angelegt." }, { status: 404, headers: { "cache-control": "no-store" } });

  const origin = request.headers.get("origin");
  const headers = new Headers({ "cache-control": "no-store" });
  if (originMatches(origin, site.domain)) headers.set("access-control-allow-origin", origin as string);
  return Response.json({ siteId: site.id, eventEndpoint: `${url.origin}/api/control-event` }, { headers });
};

export const config = { path: "/api/control-config" };
