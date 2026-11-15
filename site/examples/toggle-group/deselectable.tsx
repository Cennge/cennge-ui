"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "cennge-ui";

const runs = [
  { name: "e2e (webkit)", repository: "cennge-ui", passed: true },
  { name: "scrape nightly", repository: "playwright-msi-scraper", passed: false },
  { name: "unit", repository: "payload-cache", passed: true },
  { name: "deploy preview", repository: "ai-niche-scout", passed: true },
];

export default function RunFilter() {
  const [status, setStatus] = useState<string | null>(null);
  const shown = runs.filter((run) => status === null || run.passed === (status === "passed"));

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <ToggleGroup aria-label="Run status" size="sm" isDeselectable value={status} onValueChange={setStatus}>
          <ToggleGroupItem value="passed">Passed</ToggleGroupItem>
          <ToggleGroupItem value="failed">Failed</ToggleGroupItem>
        </ToggleGroup>
        <span className="text-sm text-muted">{status === null ? "All runs" : `${shown.length} of ${runs.length} runs`}</span>
      </div>
      <ul className="flex flex-col gap-1.5 text-sm">
        {shown.map((run) => (
          <li key={run.name} className="flex justify-between gap-4">
            <span className="truncate">
              {run.repository} <span className="text-muted">{run.name}</span>
            </span>
            <span className={run.passed ? "text-success-text" : "text-danger-text"}>{run.passed ? "Passed" : "Failed"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
