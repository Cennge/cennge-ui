import type { CSSProperties } from "react";

type Row = { name: string; value: string };

// From the library's package.json: dependencies, peerDependencies, and what it does without.
const groups: { title: string; mark: "accent" | "ink" | "empty"; rows: Row[] }[] = [
  {
    title: "Installed with it",
    mark: "accent",
    rows: [
      { name: "radix-ui", value: "^1.8.1" },
      { name: "tailwind-variants", value: "^3.3.1" },
      { name: "tailwind-merge", value: "^3.7.0" },
      { name: "clsx", value: "^2.1.1" },
    ],
  },
  {
    title: "Yours already",
    mark: "ink",
    rows: [
      { name: "react", value: "17, 18 or 19" },
      { name: "react-dom", value: "17, 18 or 19" },
      { name: "tailwindcss", value: "4" },
      { name: "maplibre-gl", value: "6, for the map only" },
    ],
  },
  {
    title: "Not in it",
    mark: "empty",
    rows: [
      { name: "framer-motion", value: "CSS transitions instead" },
      { name: "CSS-in-JS", value: "Tailwind classes instead" },
      { name: "A chart library", value: "Its own SVG instead" },
      { name: "A date library", value: "Intl instead" },
    ],
  },
];

function Group({ group, order }: { group: (typeof groups)[number]; order: number }) {
  return (
    <div className="deps-group" data-reveal style={{ "--i": order } as CSSProperties}>
      <h3 className="text-base font-normal text-muted">{group.title}</h3>
      <ul className="mt-2">
        {group.rows.map((row) => (
          <li key={row.name} className="deps-row">
            <span className="flex items-center gap-2">
              <span className={`deps-mark deps-mark-${group.mark}`} aria-hidden="true" />
              <span className="text-base">{row.name}</span>
            </span>
            <span className="text-[15px] text-muted tabular-nums">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Dependencies() {
  return (
    <section className="deps" aria-labelledby="deps-title">
      <h2 id="deps-title" className="landing-heading deps-title" data-reveal>
        Four dependencies
      </h2>
      <div className="deps-columns">
        <div className="deps-column">
          <Group group={groups[0]!} order={1} />
          <Group group={groups[1]!} order={2} />
        </div>
        <div className="deps-column">
          <Group group={groups[2]!} order={3} />
          <p className="deps-note" data-reveal style={{ "--i": 4 } as CSSProperties}>
            Each component is its own chunk, so a page carries only what it imports. Motion is CSS that respects
            reduced motion; dates are ISO strings, named and ordered by Intl.
          </p>
        </div>
      </div>
    </section>
  );
}
