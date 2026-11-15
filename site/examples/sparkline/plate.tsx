"use client";

import type { ReactNode } from "react";
import { Sparkline } from "cennge-ui/charts";

// Commits per week over the last 12 weeks.
const repositories = [
  { name: "cennge-ui", commits: [31, 35, 29, 38, 42, 36, 44, 51, 47, 43, 52, 48] },
  { name: "spredo-crypto-screener", commits: [22, 19, 24, 18, 15, 17, 14, 16, 12, 13, 11, 15] },
  { name: "ai-niche-scout", commits: [4, 6, 5, 9, 8, 12, 10, 14, 11, 9, 13, 12] },
  { name: "payload-cache", commits: [12, 11, 13, 12, 10, 12, 11, 13, 12, 11, 10, 9] },
  { name: "playwright-msi-scraper", commits: [9, 7, 8, 5, 6, 4, 6, 3, 4, 2, 3, 3] },
];

const openIssues = [31, 34, 33, 38, 36, 29, 27, 30, 24, 22, 23, 19];
const ciMinutes = [1700, 1810, 2040, 2250, 2340, 2370, 2700, 2840];

function Tile({ label, value, change, children }: { label: string; value: string; change: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 basis-40 flex-col gap-1 rounded-large bg-surface-3 p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{change}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function SparklinePlate() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <Tile label="Open issues, ai-niche-scout" value="19" change="down from 31 in 12 weeks">
          <Sparkline aria-label="Open issues over 12 weeks, down from 31 to 19" data={openIssues} variant="area" color="success" className="h-10 w-full" />
        </Tile>
        <Tile label="CI minutes in October" value="2,840" change="up from 1,700 in March">
          <Sparkline aria-label="CI minutes per month since March, up from 1,700 to 2,840" data={ciMinutes} variant="area" className="h-10 w-full" />
        </Tile>
      </div>
      <div>
        <div className="mb-1 flex justify-between text-xs text-muted">
          <span>Commits per week, last 12 weeks</span>
          <span>Last week</span>
        </div>
        <ul className="divide-y divide-border">
          {repositories.map(({ name, commits }) => (
            <li key={name} className="flex items-center gap-3 py-2 text-sm">
              <span className="min-w-0 flex-1 truncate">{name}</span>
              <Sparkline aria-label={`${name}: commits per week over 12 weeks, from ${commits[0]} to ${commits.at(-1)}`} data={commits} />
              <span className="w-8 text-right font-semibold tabular-nums">{commits.at(-1)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
