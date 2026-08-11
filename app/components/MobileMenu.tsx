"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const links = [
  ["Leistungen", "/leistungen"],
  ["Ansatz", "/ansatz"],
  ["Referenzen", "/referenzen"],
  ["Kontakt", "/kontakt"],
] as const;

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  return <div className="mobile-menu">
    <button className="menu-toggle" type="button" aria-label={open ? "Menü schließen" : "Menü öffnen"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((current) => !current)}>
      <b>{open ? "Schließen" : "Menü"}</b><span /><span />
    </button>
    {open && typeof document !== "undefined" && createPortal(<nav id="mobile-navigation" className="mobile-navigation is-open" aria-label="Mobile Navigation">
      <p>Pracht Performance</p>
      <div>{links.map(([label, href], index) => <a href={href} key={href} onClick={() => setOpen(false)}><span>0{index + 1}</span>{label}<b>↗</b></a>)}</div>
      <a className="mobile-menu-contact" href="mailto:info@pracht-performance.de" onClick={() => setOpen(false)}>info@pracht-performance.de</a>
    </nav>, document.body)}
  </div>;
}
