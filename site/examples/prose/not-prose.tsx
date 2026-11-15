"use client";

import { Prose, Snippet } from "cennge-ui";

export default function InstallSection() {
  return (
    <Prose className="w-full max-w-prose">
      <h3>Install</h3>
      <p>One package, with React and Tailwind CSS as its peer dependencies.</p>
      {/* not-prose: the Snippet keeps its own look instead of the prose code block's. */}
      <div className="not-prose">
        <Snippet>pnpm add cennge-ui</Snippet>
      </div>
      {/* A utility class on an element inside wins over the prose styles. */}
      <p className="text-sm text-muted">React 17, 18 and 19; Tailwind CSS 4.</p>
    </Prose>
  );
}
