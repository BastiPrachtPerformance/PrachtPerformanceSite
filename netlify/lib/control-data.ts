import { getStore } from "@netlify/blobs";
import { randomBytes } from "node:crypto";

export type SiteState = "Aktiv" | "Wartung" | "404";
export type ConnectionState = "Nicht verbunden" | "Verbunden";
export type ControlEvent = "page_view" | "contact_click" | "form_submit";

export type TrafficPoint = {
  date: string;
  pageViews: number;
  contactClicks: number;
  formSubmissions: number;
};

export type ControlSite = {
  id: string;
  name: string;
  domain: string;
  hosting: string;
  state: SiteState;
  connection: ConnectionState;
  update: string;
  createdAt: string;
  controlToken: string;
};

export type ControlData = {
  schemaVersion: 2;
  sites: ControlSite[];
  logs: string[];
  analytics: Record<string, TrafficPoint[]>;
  updatedAt: string;
};

function createToken() {
  return randomBytes(24).toString("base64url");
}

function createSeed(): ControlData {
  return {
    schemaVersion: 2,
    sites: [],
    logs: ["Pracht Control ist bereit. Lege jetzt die erste Kundenwebsite an."],
    analytics: {},
    updatedAt: new Date().toISOString(),
  };
}

function store() {
  return getStore({ name: "pracht-control", consistency: "strong" });
}

function isCurrentData(value: ControlData | null): value is ControlData {
  return Boolean(value && value.schemaVersion === 2 && Array.isArray(value.sites) && value.sites.every((site) => "connection" in site && "controlToken" in site) && value.analytics);
}

export async function getControlData() {
  const saved = await store().get("dashboard", { type: "json", consistency: "strong" }) as ControlData | null;
  if (isCurrentData(saved)) return saved;

  const next = createSeed();
  await store().setJSON("dashboard", next);
  return next;
}

export async function saveControlData(data: ControlData) {
  const next = { ...data, updatedAt: new Date().toISOString() };
  await store().setJSON("dashboard", next);
  return next;
}

export function createSite(data: ControlData, input: { name: string; domain: string; hosting?: string }) {
  const domain = input.domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const baseId = domain.replace(/^www\./, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "kunde";
  let id = baseId;
  let index = 2;
  while (data.sites.some((site) => site.id === id)) id = `${baseId}-${index++}`;

  const site: ControlSite = {
    id,
    name: input.name.trim(),
    domain,
    hosting: input.hosting?.trim() || "Netlify",
    state: "Aktiv",
    connection: "Nicht verbunden",
    update: "Control Kit noch nicht installiert",
    createdAt: new Date().toISOString(),
    controlToken: createToken(),
  };
  data.sites.push(site);
  data.analytics[site.id] = [];
  data.logs = [`${site.name} als Kundenwebsite angelegt`, ...data.logs].slice(0, 50);
  return site;
}

export function trafficForSite(data: ControlData, siteId: string, days = 30) {
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - (days - 1));
  const dateKeys = Array.from({ length: days }, (_, index) => {
    const date = new Date(from);
    date.setUTCDate(from.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });
  const entries = new Map((data.analytics[siteId] ?? []).map((entry) => [entry.date, entry]));
  return dateKeys.map((date) => entries.get(date) ?? { date, pageViews: 0, contactClicks: 0, formSubmissions: 0 });
}

export function addControlEvent(data: ControlData, siteId: string, event: ControlEvent) {
  const date = new Date().toISOString().slice(0, 10);
  const entries = data.analytics[siteId] ?? [];
  let point = entries.find((entry) => entry.date === date);
  if (!point) {
    point = { date, pageViews: 0, contactClicks: 0, formSubmissions: 0 };
    entries.push(point);
  }
  if (event === "page_view") point.pageViews += 1;
  if (event === "contact_click") point.contactClicks += 1;
  if (event === "form_submit") point.formSubmissions += 1;
  data.analytics[siteId] = entries.slice(-90);
}
