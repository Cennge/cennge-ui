import { Button, Prose } from "cennge-ui";

const longLine =
  'pnpm exec playwright test --project=chromium --project=firefox --project=webkit --reporter=list --grep "keyboard focus is visible"';

/** Markdown as a renderer would output it: the README of this repository, shortened. */
export default function ProseFixture() {
  return (
    <>
      <Prose className="max-w-prose">
        <h1>cennge-ui</h1>
        <p className="lead">Tactile, dark-first React components on Radix UI and Tailwind CSS v4.</p>
        <p>
          <img alt="npm version" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='20'><rect width='80' height='20' rx='3' fill='%23fb6c1a'/></svg>" />{" "}
          <img alt="license MIT" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='20'><rect width='60' height='20' rx='3' fill='%2312b85f'/></svg>" />
        </p>
        <h2 id="install">Install</h2>
        <p>
          Add the package, then one line in your stylesheet. See <a href="#theming">Theming</a> for colours, or read the{" "}
          <a href="https://github.com/Cennge/cennge-ui">source on GitHub</a>.
        </p>
        <pre>
          <code>{"pnpm add cennge-ui\n\n@import \"tailwindcss\";\n@import \"cennge-ui/styles.css\";"}</code>
        </pre>
        <pre>
          <code>{longLine}</code>
        </pre>
        <h3>
          Requirements: <code>react</code> 17 or newer
        </h3>
        <ul>
          <li>
            React 18 and 19 first; <strong>17 works</strong> too.
          </li>
          <li>
            Tailwind CSS v4 with <code>@source</code> pointing at the package.
            <ul>
              <li>Next.js App Router: nothing else to do.</li>
            </ul>
          </li>
        </ul>
        <ol>
          <li>Install</li>
          <li>Import the styles</li>
          <li>
            Press <kbd>Ctrl</kbd> + <kbd>K</kbd>
          </li>
        </ol>
        <ul className="contains-task-list">
          <li className="task-list-item">
            <input type="checkbox" defaultChecked disabled aria-label="Done" /> Slider marks
          </li>
          <li className="task-list-item">
            <input type="checkbox" disabled aria-label="Not done" /> Carousel
          </li>
        </ul>
        <blockquote>
          <p>
            Updates instead of copy-paste: install once, fix bugs <mark>centrally</mark>.
          </p>
        </blockquote>
        <h2 id="theming">Theming</h2>
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th align="center">Light</th>
              <th align="right">Dark</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>--cennge-primary</code>
              </td>
              <td align="center">orange-500</td>
              <td align="right">orange-500</td>
            </tr>
            <tr>
              <td>
                <code>--cennge-surface-1</code>
              </td>
              <td align="center">#eef0f3</td>
              <td align="right">#111317</td>
            </tr>
          </tbody>
        </table>
        <hr />
        <details>
          <summary>Why not CSS-in-JS?</summary>
          <p>
            Plain CSS variables cost nothing at runtime and work in Server Components. <del>styled-components</del>
          </p>
        </details>
        <h2 className="text-sm text-muted" data-testid="own-heading">
          A heading with its own classes
        </h2>
        <div className="not-prose flex items-center gap-3" data-testid="not-prose">
          <h2>Not prose</h2>
          <Button size="sm">Still a button</Button>
          <a href="#install">plain link</a>
        </div>
      </Prose>

      <Prose size="sm" asChild>
        <article data-testid="small">
          <h2>Changelog</h2>
          <p>Small text for side notes.</p>
        </article>
      </Prose>
    </>
  );
}
