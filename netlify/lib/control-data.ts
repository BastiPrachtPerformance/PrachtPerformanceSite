import { getStore } from "@netlify/blobs";

export type SiteState = "Aktiv" | "Wartung" | "404";

export type ControlSite = {
  id: string;
  name: string;
  domain: string;
  hosting: string;
  visits: string;
  state: SiteState;
  update: string;
};

export type ControlData = {
  sites: ControlSite[];
  logs: string[];
  leads: number;
  updatedAt: string;
};

const seed: ControlData = {
  sites: [
    { id: "pracht", name: "Pracht Performance", domain: "pracht-performance.de", hosting: "Netlify", visits: "1.284", state: "Aktiv", update: "Initial eingerichtet" },
    { id: "ck", name: "CKEVENTCENTER", domain: "ckeventcenter.de", hosting: "Netlify", visits: "847", state: "Aktiv", update: "Initial eingerichtet" },
    { id: "en", name: "E&N Dienstleistung", domain: "en-dienstleistung.de", hosting: "Netlify", visits: "603", state: "Aktiv", update: "Initial eingerichtet" },
    { id: "ud", name: "Urlaub Duhnen", domain: "urlaubduhnen.de", hosting: "Netlify", visits: "491", state: "Wartung", update: "Initial eingerichtet" },
    { id: "zizou", name: "ZIZOU Clothing", domain: "zizouclothing.com", hosting: "Netlify", visits: "328", state: "Aktiv", update: "Initial eingerichtet" },
    { id: "vhg", name: "VHG Dirk Grosser", domain: "vhg.de", hosting: "Netlify", visits: "215", state: "Aktiv", update: "Initial eingerichtet" },
  ],
  logs: ["Pracht Control wurde eingerichtet."],
  leads: 0,
  updatedAt: "Initial eingerichtet",
};

function store() {
  return getStore({ name: "pracht-control", consistency: "strong" });
}

export async function getControlData() {
  const saved = await store().get("dashboard", { type: "json", consistency: "strong" }) as ControlData | null;
  if (saved) return saved;
  await store().setJSON("dashboard", seed);
  return seed;
}

export async function saveControlData(data: ControlData) {
  const next = { ...data, updatedAt: new Date().toISOString() };
  await store().setJSON("dashboard", next);
  return next;
}
