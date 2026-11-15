"use client";

import { Prose } from "cennge-ui";

/** The Install section of the cennge-ui README, as a Markdown renderer outputs it. */
export default function ReadmeInstall() {
  return (
    <Prose className="w-full max-w-prose">
      <h2>Install</h2>
      <p>
        Add the package, then two lines in your stylesheet. The second registers the package with Tailwind, adds the tokens
        and makes <code>dark:</code> class-based. The source is <a href="https://github.com/Cennge/cennge-ui">on GitHub</a>.
      </p>
      <pre>
        <code>{'pnpm add cennge-ui\n\n/* app.css */\n@import "tailwindcss";\n@import "cennge-ui/styles.css";'}</code>
      </pre>
      <h3>Peer dependencies</h3>
      <ul>
        <li>
          <code>react</code> and <code>react-dom</code> 17, 18 or 19
        </li>
        <li>
          <code>tailwindcss</code> 4
        </li>
        <li>
          <code>maplibre-gl</code> 6, <strong>only for maps</strong>
        </li>
      </ul>
      <p>To run the end-to-end tests on desktop:</p>
      <pre>
        <code>pnpm exec playwright test --project=chromium --project=firefox --project=webkit</code>
      </pre>
    </Prose>
  );
}
