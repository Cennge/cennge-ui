"use client";

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

/** The page's headings, read from the article once it is on screen, with the one being read marked. */
export function OnThisPage() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const elements = [...document.querySelectorAll<HTMLHeadingElement>("[data-reading] :is(h2, h3)[id]")];
    setHeadings(
      elements.map((element) => ({
        id: element.id,
        // The anchor's "#" is not part of the title.
        text: [...element.childNodes].filter((node) => !(node instanceof HTMLAnchorElement)).map((node) => node.textContent).join("").trim(),
        level: element.tagName === "H3" ? 3 : 2,
      })),
    );
    // The current heading is the last one that has scrolled past the top fifth of the screen.
    const update = () => {
      const line = window.innerHeight * 0.2;
      let found: string | null = null;
      for (const element of elements) if (element.getBoundingClientRect().top < line) found = element.id;
      setCurrent(found ?? elements[0]?.id ?? null);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (headings.length < 2) return null;
  return (
    <nav aria-labelledby="on-this-page" className="max-xl:hidden">
      <h2 id="on-this-page" className="mb-2 text-[15px] font-semibold">
        On this page
      </h2>
      <ul className="flex flex-col gap-px text-sm">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={heading.id === current ? "location" : undefined}
              className={`block rounded-small py-1 leading-snug text-muted transition-colors duration-(--cennge-duration-fast) hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-solid aria-[current]:font-medium aria-[current]:text-primary-text ${heading.level === 3 ? "pl-3" : ""}`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
