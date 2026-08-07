"use client";

import { useEffect } from "react";

export function ScrollEffects() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = Array.from(document.querySelectorAll<HTMLElement>("main > section, .client-logo, .reference-card, .detail-service, .approach-steps article"));
    targets.forEach((element, index) => {
      element.classList.add("scroll-reveal");
      element.style.setProperty("--stagger", `${(index % 5) * 65}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-in-view")),
      { threshold: 0.12, rootMargin: "0px 0px -8%" },
    );
    targets.forEach((element) => observer.observe(element));

    const parallaxItems = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      parallaxItems.forEach((element) => {
        const speed = Number(element.dataset.parallax ?? 0.05);
        const top = element.getBoundingClientRect().top;
        element.style.setProperty("--parallax-y", `${Math.round((window.innerHeight * 0.5 - top) * speed)}px`);
      });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(updateParallax); };
    updateParallax();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener("scroll", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);
  return null;
}
