"use client";

import { useState, type CSSProperties } from "react";
import { Combobox } from "cennge-ui";
import facts from "@/generated/facts.json";
import { nav } from "@/lib/nav";

type Fact = { gzip: number | null };

// Every component page with a measured import, named as in the sidebar.
const items = nav
  .filter((family) => family.title !== "Getting started")
  .flatMap((family) =>
    family.pages
      .filter((page) => (facts as Record<string, Fact>)[page.slug]?.gzip)
      .map((page) => ({ value: page.slug, label: page.title, description: family.title })),
  );

const bytes = (slug: string) => (facts as Record<string, Fact>)[slug]?.gzip ?? 0;

export function Weight() {
  const [picked, setPicked] = useState<string[]>(["button", "input", "select", "dialog", "table", "toast"]);
  const total = picked.reduce((sum, slug) => sum + bytes(slug), 0);
  const kb = (total / 1024).toFixed(1);

  return (
    <section className="weight" aria-labelledby="weight-title">
      <div className="weight-top" data-reveal>
        <h2 id="weight-title" className="landing-headline">
          What will you import?
        </h2>
        <div data-ui className="weight-control">
          <Combobox
            selectionMode="multiple"
            label="Components"
            items={items}
            values={picked}
            onValuesChange={setPicked}
            placeholder="Add a component"
          />
        </div>
      </div>
      <div className="weight-bottom">
        <p className="weight-figure" data-reveal aria-live="polite">
          <span key={kb} className="weight-number">
            {kb}
          </span>
          <span className="weight-unit">KB gzip</span>
        </p>
        <p className="weight-note" data-reveal style={{ "--i": 1 } as CSSProperties}>
          The sum of each import measured on its own with esbuild and gzip, React, Radix and the other
          dependencies aside. Code that two components share is counted twice here, so the library’s part of your
          bundle comes in under it.
        </p>
      </div>
    </section>
  );
}
