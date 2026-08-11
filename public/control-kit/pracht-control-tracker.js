// Pracht Control — cookie-freier Event-Tracker
// In der Kundenwebsite mit window.PrachtControl = { url: "https://deine-pracht-domain.de", siteId: "..." } konfigurieren.
(() => {
  const settings = window.PrachtControl;
  if (!settings?.url || !settings?.siteId) return;
  const send = (event) => fetch(`${settings.url}/api/control-event`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ siteId: settings.siteId, event }), keepalive: true }).catch(() => undefined);
  send("page_view");
  document.addEventListener("click", (event) => {
    const target = event.target.closest("a, button");
    if (!target) return;
    const href = target.getAttribute("href") || "";
    if (/^(tel:|mailto:|https:\/\/wa\.me\/)/i.test(href) || target.matches("[data-pracht-contact]")) send("contact_click");
  });
  window.PrachtControlFormSuccess = () => send("form_submit");
})();
