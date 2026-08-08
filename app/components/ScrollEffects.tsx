"use client";

import { useEffect, useRef, useState } from "react";

export function ScrollEffects() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 780);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReady(true);
      return () => window.clearTimeout(timer);
    }

    const targets = Array.from(document.querySelectorAll<HTMLElement>("main > section:not(.edition-hero):not(.manifesto-hero):not(.atelier-hero):not(.studio-hero):not(.editorial-hero):not(.sub-hero), .client-logo, .reference-card, .detail-service, .approach-steps article, .service-columns a, .contact-topic-grid a"));
    targets.forEach((element, index) => { element.classList.add("scroll-reveal"); element.style.setProperty("--stagger", `${(index % 5) * 65}ms`); });
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-in-view")), { threshold: 0.12, rootMargin: "0px 0px -8%" });
    targets.forEach((element) => observer.observe(element));

    const parallaxItems = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const tiltItems = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-tilt]"));
    const heroGrid = document.querySelector<HTMLElement>(".editorial-hero-layout");
    const heroScroll = document.querySelector<HTMLElement>(".editorial-scroll");
    let frame = 0;
    const updateMotion = () => {
      frame = 0;
      const scrollY = window.scrollY;
      const scrollRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      document.documentElement.style.setProperty("--page-progress", String(Math.min(scrollY / scrollRange, 1)));
      if (heroGrid) { heroGrid.style.transform = `translate3d(0, ${Math.min(scrollY * 0.12, 118)}px, 0) scale(${Math.max(1 - scrollY / 12000, .96)})`; heroGrid.style.opacity = String(Math.max(1 - scrollY / 1100, .3)); }
      if (heroScroll) heroScroll.style.transform = `translate3d(0, ${Math.min(scrollY * 0.2, 115)}px, 0)`;
      parallaxItems.forEach((element) => { const speed = Number(element.dataset.parallax ?? 0.05); const top = element.getBoundingClientRect().top; element.style.setProperty("--parallax-y", `${Math.round((window.innerHeight * .5 - top) * speed)}px`); });
      tiltItems.forEach((element) => { const rect = element.getBoundingClientRect(); const amount = Math.max(-1, Math.min(1, (window.innerHeight * .5 - (rect.top + rect.height / 2)) / window.innerHeight)); element.style.setProperty("--scroll-rotate", `${amount * Number(element.dataset.scrollTilt ?? 7)}deg`); });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(updateMotion); };
    const onPointerMove = (event: PointerEvent) => { if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`; };
    updateMotion(); window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => { window.clearTimeout(timer); observer.disconnect(); window.removeEventListener("scroll", onScroll); window.removeEventListener("pointermove", onPointerMove); if (frame) cancelAnimationFrame(frame); };
  }, []);

  return <><div className={`site-loader ${ready ? "is-ready" : ""}`} aria-hidden="true"><img src="/preview.png" alt="" /><b>PRACHT PERFORMANCE</b></div><div className="scroll-progress" aria-hidden="true"><i /></div><div className="cursor-cross" ref={cursorRef} aria-hidden="true"><i /><b /><em>P/</em></div></>;
}
