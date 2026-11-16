"use client";

import { useState } from "react";
import { SwipeActions, toast } from "cennge-ui";

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const initial = [
  { id: "e2e", name: "e2e (webkit)", repository: "cennge-ui" },
  { id: "scrape", name: "scrape nightly", repository: "playwright-msi-scraper" },
  { id: "unit", name: "unit", repository: "payload-cache" },
];

export default function FailedRuns() {
  const [runs, setRuns] = useState(initial);
  const [rerun, setRerun] = useState<string[]>([]);

  const remove = (id: string) => {
    const index = runs.findIndex((run) => run.id === id);
    const run = runs[index]!;
    setRuns((all) => all.filter((entry) => entry.id !== id));
    toast(`Dismissed ${run.name}`, {
      action: { label: "Undo", onClick: () => setRuns((all) => [...all.slice(0, index), run, ...all.slice(index)]) },
    });
  };

  return (
    <ul className="w-full max-w-[22rem] divide-y divide-border overflow-hidden rounded-large border border-border">
      {runs.map((run) => (
        <li key={run.id}>
          <SwipeActions
            label={`${run.name}, ${run.repository}`}
            leadingActions={[
              { key: "rerun", label: "Re-run", icon: icon("M4 12a8 8 0 1 0 3-6.2M4 4v4h4"), color: "success", onAction: () => setRerun((all) => [...all, run.id]) },
            ]}
            trailingActions={[{ key: "dismiss", label: "Dismiss", icon: icon("M6 6l12 12M18 6 6 18"), color: "danger", onAction: () => remove(run.id) }]}
          >
            <div className="px-4 py-3">
              <p className="text-sm font-medium">{run.name}</p>
              <p className="text-xs text-muted">
                {run.repository}
                {rerun.includes(run.id) ? " · re-running" : " · failed"}
              </p>
            </div>
          </SwipeActions>
        </li>
      ))}
      {runs.length ? null : <li className="px-4 py-6 text-center text-sm text-muted">No failed runs.</li>}
    </ul>
  );
}
