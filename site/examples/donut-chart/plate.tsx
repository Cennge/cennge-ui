"use client";

import { DonutChart } from "cennge-ui/charts";

const minutes = [
  { repository: "cennge-ui", minutes: 1610 },
  { repository: "playwright-msi-scraper", minutes: 390 },
  { repository: "payload-cache", minutes: 350 },
  { repository: "ai-niche-scout", minutes: 280 },
  { repository: "spredo-crypto-screener", minutes: 210 },
];

export default function DonutChartPlate() {
  return (
    // Clips the chart's visually hidden data table, which is as wide as its rows, to the plate.
    <div className="relative -m-2 flex w-[calc(100%+1rem)] flex-col gap-4 overflow-hidden p-2">
      <div>
        <p className="text-sm font-semibold">CI minutes in October</p>
        <p className="text-xs text-muted">By repository · sample data</p>
      </div>
      <DonutChart
        aria-label="CI minutes in October by repository"
        data={minutes}
        index="repository"
        value="minutes"
        indexLabel="Repository"
        valueLabel="Minutes"
        labels={{ total: "Minutes" }}
        className="max-w-96"
      />
    </div>
  );
}
