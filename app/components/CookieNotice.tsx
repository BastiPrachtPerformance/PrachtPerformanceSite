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

  return <aside className="cookie-notice" role="dialog" aria-modal="true" aria-labelledby="cookie-title" aria-describedby="cookie-copy">
    <div className="cookie-notice-panel">
      <p className="cookie-notice-index">P/ — HINWEIS</p>
      <h2 id="cookie-title">Cookies &amp;<br /><em>Datenschutz.</em></h2>
      <p id="cookie-copy">Wir verwenden ausschließlich technisch notwendige Technologien, damit diese Website zuverlässig funktioniert. Analyse- und Marketing-Cookies werden nicht eingesetzt.</p>
      <div className="cookie-notice-actions"><button type="button" onClick={() => setAccepted(true)}>Weiter zur Website <span>↗</span></button><a href="/datenschutz">Datenschutz</a></div>
    </div>
  </aside>;
}
