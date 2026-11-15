"use client";

import { useRef } from "react";
import { Button, ScrollArea } from "cennge-ui";

const releases = [
  { version: "0.3.1", date: "2026-11-01" },
  { version: "0.3.0", date: "2026-10-31" },
  { version: "0.2.0", date: "2026-10-21" },
  { version: "0.1.1", date: "2026-10-20" },
  { version: "0.1.0", date: "2026-10-19" },
];

export default function JumpToEnd() {
  const viewport = useRef<HTMLDivElement>(null);

  const scrollTo = (top: number) => viewport.current?.scrollTo({ top, behavior: "smooth" });

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <ScrollArea aria-label="Releases" viewportRef={viewport} type="always" className="h-40 rounded-large border border-border bg-surface-1">
        <ol className="flex flex-col p-2">
          {releases.map((release) => (
            <li key={release.version} className="flex items-baseline justify-between gap-3 rounded-small px-3 py-2.5">
              <span className="text-sm font-medium">cennge-ui {release.version}</span>
              <time dateTime={release.date} className="text-xs text-muted tabular-nums">
                {release.date}
              </time>
            </li>
          ))}
        </ol>
      </ScrollArea>
      <div className="flex gap-2">
        <Button size="sm" variant="flat" onClick={() => scrollTo(0)}>
          Newest
        </Button>
        <Button size="sm" variant="flat" onClick={() => scrollTo(viewport.current?.scrollHeight ?? 0)}>
          Oldest
        </Button>
      </div>
    </div>
  );
}
