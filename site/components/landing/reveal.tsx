"use client";

import { useLayoutEffect } from "react";

/**
 * Brings each [data-reveal] in the landing page in as it scrolls into view, once. What is already on
 * screen when the page hydrates stays as the server painted it; only what is below waits for its turn.
 */
export function Reveal() {
  useLayoutEffect(() => {
    const root = document.querySelector(".landing");
    if (!root || !("IntersectionObserver" in window)) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    for (const item of items) {
      const box = item.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) item.classList.add("is-in");
    }
    root.classList.add("is-revealing");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    items.forEach((item) => item.classList.contains("is-in") || observer.observe(item));
    return () => observer.disconnect();
  }, []);
  return null;
}
