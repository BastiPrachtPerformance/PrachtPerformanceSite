import { clearSessionCookie, controlIsConfigured, createSessionCookie, hasControlSession, passwordMatches } from "../lib/control-auth";

const json = (body: unknown, status = 200, headers: HeadersInit = {}) => Response.json(body, { status, headers: { "cache-control": "no-store", ...headers } });

export default async (request: Request) => {
  const url = new URL(request.url);

  if (request.method === "GET") {
    return json({ authenticated: hasControlSession(request), configured: controlIsConfigured() });
  }

  if (request.method !== "POST") return json({ error: "Methode nicht erlaubt" }, 405);

  const action = url.searchParams.get("action") ?? "login";
  if (action === "logout") return json({ authenticated: false }, 200, { "set-cookie": clearSessionCookie() });
  if (!controlIsConfigured()) return json({ error: "Pracht Control muss zuerst in Netlify konfiguriert werden." }, 503);

  const body = await request.json().catch(() => null) as { password?: string } | null;
  if (!body?.password || !passwordMatches(body.password)) return json({ error: "Passwort nicht korrekt." }, 401);
  return json({ authenticated: true }, 200, { "set-cookie": createSessionCookie() });
};

export const config = { path: "/api/control-auth" };
