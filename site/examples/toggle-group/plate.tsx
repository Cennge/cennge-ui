"use client";

import { useState } from "react";
import { Badge, ToggleGroup, ToggleGroupItem } from "cennge-ui";

interface Issue {
  repository: string;
  title: string;
  state: "open" | "closed";
  labels: string[];
}

const issues: Issue[] = [
  { repository: "ai-niche-scout", title: "Export niches to CSV", state: "open", labels: ["feature"] },
  { repository: "payload-cache", title: "Stale page after a draft is published", state: "open", labels: ["bug"] },
  { repository: "payload-cache", title: "Document the cache options", state: "open", labels: ["docs"] },
  { repository: "spredo-crypto-screener", title: "Sort pairs by spread", state: "closed", labels: ["feature"] },
  { repository: "playwright-msi-scraper", title: "Retry a page that timed out", state: "closed", labels: ["bug"] },
  { repository: "cennge-ui", title: "Theming guide", state: "closed", labels: ["docs"] },
];

const states = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "all", label: "All" },
];

function StateIcon({ state }: { state: Issue["state"] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`size-4 shrink-0 ${state === "open" ? "text-success-text" : "text-muted"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      {state === "open" ? (
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      ) : (
        <path d="m8.5 12.5 2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export default function IssueFilters() {
  const [state, setState] = useState<string | null>("open");
  const [labels, setLabels] = useState<string[]>([]);

  const labelled = issues.filter((issue) => labels.length === 0 || issue.labels.some((label) => labels.includes(label)));
  const count = (value: string) => labelled.filter((issue) => value === "all" || issue.state === value).length;
  const shown = labelled.filter((issue) => state === "all" || issue.state === state);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup aria-label="Issue state" value={state} onValueChange={setState}>
          {states.map(({ value, label }) => (
            <ToggleGroupItem key={value} value={value}>
              {label}
              <span className="text-xs tabular-nums opacity-70">{count(value)}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ToggleGroup selectionMode="multiple" variant="bordered" color="primary" size="sm" aria-label="Labels" value={labels} onValueChange={setLabels}>
          <ToggleGroupItem value="bug">bug</ToggleGroupItem>
          <ToggleGroupItem value="feature">feature</ToggleGroupItem>
          <ToggleGroupItem value="docs">docs</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <ul className="divide-y divide-border rounded-large bg-surface-1">
        {shown.map((issue) => (
          <li key={issue.title} className="flex items-center gap-3 px-4 py-2.5">
            <StateIcon state={issue.state} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{issue.title}</p>
              <p className="truncate text-xs text-muted">{issue.repository}</p>
            </div>
            {issue.labels.map((label) => (
              <Badge key={label} size="sm">
                {label}
              </Badge>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
