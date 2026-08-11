"use client";

import { useEffect, useState } from "react";

export function CookieNotice() {
  const [accepted, setAccepted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem("pracht-cookie-notice-seen") === "true") return;
    const timer = window.setTimeout(() => setVisible(true), 2050);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible || accepted) return null;

  return <aside className="cookie-notice" role="status" aria-live="polite" aria-labelledby="cookie-copy">
    <div className="cookie-notice-panel">
      <p id="cookie-copy">Diese Website verwendet Cookies.</p>
      <div className="cookie-notice-actions"><button type="button" onClick={() => { window.localStorage.setItem("pracht-cookie-notice-seen", "true"); setAccepted(true); }}>Okay</button></div>
    </div>
  </aside>;
}
