"use client";

import type { ReactNode } from "react";
import { BarChart } from "cennge-ui/charts";

const issues = [
  { month: "May", opened: 18, closed: 12 },
  { month: "Jun", opened: 24, closed: 22 },
  { month: "Jul", opened: 31, closed: 26 },
  { month: "Aug", opened: 27, closed: 30 },
  { month: "Sep", opened: 35, closed: 33 },
  { month: "Oct", opened: 29, closed: 34 },
];

const backlog = [
  { repository: "cennge-ui", bug: 3, enhancement: 8, question: 2 },
  { repository: "ai-niche-scout", bug: 7, enhancement: 11, question: 3 },
  { repository: "payload-cache", bug: 2, enhancement: 5, question: 0 },
  { repository: "spredo-crypto-screener", bug: 6, enhancement: 9, question: 2 },
  { repository: "playwright-msi-scraper", bug: 4, enhancement: 3, question: 1 },
];

function Panel({ title, detail, children }: { title: string; detail: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted">{detail}</p>
      </div>
      {children}
    </div>
  );
}

export default function BarChartPlate() {
  return (
    // Clips the charts' visually hidden data tables, which are as wide as their rows, to the plate.
    <div className="relative -m-2 flex w-[calc(100%+1rem)] flex-col gap-8 overflow-hidden p-2">
      <Panel title="Issues in cennge-ui" detail="Opened and closed per month · sample data">
        <BarChart
          aria-label="Issues opened and closed in cennge-ui per month"
          data={issues}
          index="month"
          indexLabel="Month"
          series={[
            { key: "opened", label: "Opened" },
            { key: "closed", label: "Closed" },
          ]}
          className="h-60"
        />
      </Panel>
      <Panel title="Open issues by repository" detail="Stacked by label · sample data">
        <BarChart
          aria-label="Open issues by repository and label"
          data={backlog}
          index="repository"
          indexLabel="Repository"
          layout="horizontal"
          isStacked
          series={[
            { key: "bug", label: "bug" },
            { key: "enhancement", label: "enhancement" },
            { key: "question", label: "question" },
          ]}
          className="h-60"
        />
      </Panel>
    </div>
  );
}
