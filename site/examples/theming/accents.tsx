"use client";

import { Badge, Button } from "cennge-ui";

const accents = ["orange", "blue", "green", "violet", "red"] as const;

// The chart palette in order: each preset sets its own.
const slots = [
  "bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4",
  "bg-chart-5", "bg-chart-6", "bg-chart-7", "bg-chart-8",
];

export default function AccentPresets() {
  return (
    <div className="flex w-full flex-col gap-2">
      {accents.map((accent) => (
        <div
          key={accent}
          data-accent={accent}
          className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-medium bg-surface-3 px-4 py-3"
        >
          <code className="w-36 font-mono text-xs text-primary-text">data-accent="{accent}"</code>
          <div className="flex items-center gap-2">
            <Button size="sm" color="primary">
              Deploy
            </Button>
            <Badge color="primary">Live</Badge>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <span className="font-mono text-xs text-muted">chart-1…8</span>
            <span className="flex gap-1" aria-hidden="true">
              {slots.map((slot) => (
                <span key={slot} className={`size-3 rounded-full ${slot}`} />
              ))}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
