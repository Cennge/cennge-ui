"use client";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "cennge-ui";

const releases = [
  { version: "0.3.1", summary: "The README's map examples are set in New York." },
  { version: "0.3.0", summary: "Charts in cennge-ui/charts, and theme switching without a flash." },
  { version: "0.2.0", summary: "Maps in cennge-ui/map, on MapLibre GL." },
  { version: "0.1.0", summary: "First release." },
];

export default function ReleaseTags() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted">Releases</span>
      {releases.map((release) => (
        <HoverCard key={release.version} openDelay={150} closeDelay={100}>
          <HoverCardTrigger>
            <a
              href="https://github.com/Cennge/cennge-ui/blob/main/CHANGELOG.md"
              className="rounded-full bg-surface-3 px-2.5 py-1 font-mono text-xs hover:bg-surface-4"
            >
              {release.version}
            </a>
          </HoverCardTrigger>
          <HoverCardContent className="w-64">
            <p className="font-semibold">cennge-ui {release.version}</p>
            <p className="mt-1 text-muted">{release.summary}</p>
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  );
}
