"use client";

import { Prose } from "cennge-ui";

export default function ThemingArticle() {
  return (
    <div className="grid w-full gap-8 sm:grid-cols-[minmax(0,1fr)_12rem]">
      <Prose size="md" asChild>
        <article>
          <h3>Recolour without a rebuild</h3>
          <p>
            Every colour, radius and surface is a <code>--cennge-*</code> CSS variable. Switch the accent with one attribute:{" "}
            <code>data-accent="blue"</code>, on the page or on any part of it.
          </p>
        </article>
      </Prose>
      <Prose size="sm" asChild>
        <aside>
          <h4>Presets</h4>
          <ul>
            <li>orange, the default</li>
            <li>blue</li>
            <li>green</li>
            <li>violet</li>
            <li>red</li>
          </ul>
        </aside>
      </Prose>
    </div>
  );
}
