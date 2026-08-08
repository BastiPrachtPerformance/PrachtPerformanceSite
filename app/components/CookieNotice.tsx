"use client";

import { useEffect, useState } from "react";

export function CookieNotice() {
  const [accepted, setAccepted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 2050);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible || accepted) return null;

  return <aside className="cookie-notice" role="status" aria-live="polite" aria-labelledby="cookie-title" aria-describedby="cookie-copy">
    <div className="cookie-notice-panel">
      <p className="cookie-notice-index">P/ — DATENSCHUTZ</p>
      <h2 id="cookie-title">Kurz<br /><em>transparent.</em></h2>
      <p id="cookie-copy">Diese Website setzt keine Analyse- oder Marketing-Cookies ein. Mehr dazu im Datenschutz.</p>
      <div className="cookie-notice-actions"><button type="button" onClick={() => setAccepted(true)}>Alles klar <span>↗</span></button><a href="/datenschutz">Details</a></div>
    </div>
  </aside>;
}
