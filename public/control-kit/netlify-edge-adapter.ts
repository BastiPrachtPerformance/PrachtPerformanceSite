// Pracht Control — Netlify Edge Adapter
// Diese Datei in die Kundenwebsite unter netlify/edge-functions/pracht-control.ts kopieren.
// Die drei Werte ausschließlich als Netlify Environment Variables setzen.

import type { Context } from "@netlify/edge-functions";

const controlUrl = Deno.env.get("PRACHT_CONTROL_URL");
const siteId = Deno.env.get("PRACHT_CONTROL_SITE_ID");
const token = Deno.env.get("PRACHT_CONTROL_TOKEN");

function statusPage(title: string, text: string, status: number) {
  return new Response(`<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{margin:0;background:#171614;color:#f0eee8;font:16px Arial,sans-serif;display:grid;min-height:100svh;place-items:center;padding:24px}main{max-width:720px}p{color:#aaa59c;line-height:1.6}small{color:#fa5139;font-weight:700;letter-spacing:.12em}</style><main><small>PRACHT CONTROL</small><h1>${title}</h1><p>${text}</p></main></html>`, { status, headers: { "content-type": "text/html; charset=UTF-8", "cache-control": "no-store" } });
}

export default async (request: Request, context: Context) => {
  if (!controlUrl || !siteId || !token) return context.next();

  try {
    const response = await fetch(`${controlUrl}/api/control-status?siteId=${encodeURIComponent(siteId)}`, { headers: { "x-pracht-control-token": token }, signal: AbortSignal.timeout(1800) });
    if (!response.ok) return context.next();
    const { state } = await response.json() as { state?: string };
    if (state === "404") return statusPage("Seite nicht gefunden.", "Diese Website ist derzeit nicht verfügbar.", 404);
    if (state === "Wartung") return statusPage("Wir sind gleich wieder da.", "Diese Website wird gerade gewartet. Bitte versuche es in Kürze erneut.", 503);
  } catch {
    // Fail open: Bei einem Ausfall von Pracht Control bleibt die Kundenwebsite erreichbar.
  }
  return context.next();
};

export const config = { path: "/*" };
