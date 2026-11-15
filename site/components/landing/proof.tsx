import type { CSSProperties } from "react";

/*
 * Counted, not estimated: `pnpm exec playwright test --list` lists 2090 tests in 41 files, the same 418 in
 * each of the five projects of playwright.config.ts, 93 of them axe runs. tests/next lists 100: ten
 * checks in production and development, in the same five browsers. `vitest list`: 355 unit tests.
 */
const tiles: { name: string; detail: string }[] = [
  { name: "Chromium", detail: "418 tests at desktop size" },
  { name: "Firefox", detail: "418 tests, WebGL on for the map" },
  { name: "WebKit", detail: "418 tests in Safari’s engine" },
  { name: "Pixel 7", detail: "418 tests in Chromium, with touch" },
  { name: "iPhone 17", detail: "418 tests in WebKit, with touch" },
  { name: "axe", detail: "93 runs per browser, dark and light, WCAG 2.2 AA" },
  { name: "React 17", detail: "Unit tests and the published types, in CI" },
  { name: "React 18", detail: "Unit tests and the published types, in CI" },
  { name: "React 19", detail: "355 unit tests and every browser test" },
  { name: "Next.js", detail: "An App Router app on the packed package: rendered, hydrated, no warning" },
];

export function Proof() {
  return (
    <section className="proof" aria-labelledby="proof-title">
      <div className="tiles">
        <div className="tile tile-head" data-reveal>
          <h2 id="proof-title" className="landing-headline">
            Tested where it breaks
          </h2>
          <p className="max-w-[46ch] text-base leading-[1.5] text-pretty">
            2,090 end-to-end tests: the same 418 in each of five browser projects. Overlays inside overlays,
            touch, keyboard and focus. A warning in the console fails the test.
          </p>
        </div>
        {tiles.map((tile, index) => (
          <div key={tile.name} className="tile" data-reveal style={{ "--i": (index % 4) + 1 } as CSSProperties}>
            <p className="tile-name">{tile.name}</p>
            <p className="text-base leading-[1.45] text-pretty">{tile.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
