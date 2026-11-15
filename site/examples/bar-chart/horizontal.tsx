"use client";

import { BarChart } from "cennge-ui/charts";

// Sorted, so the longest bar leads.
const minutes = [
  { repository: "cennge-ui", minutes: 1610 },
  { repository: "playwright-msi-scraper", minutes: 390 },
  { repository: "payload-cache", minutes: 350 },
  { repository: "ai-niche-scout", minutes: 280 },
  { repository: "spredo-crypto-screener", minutes: 210 },
];

export default function CiMinutesByRepository() {
  return (
    <BarChart
      aria-label="CI minutes in October by repository"
      data={minutes}
      index="repository"
      indexLabel="Repository"
      layout="horizontal"
      series={[{ key: "minutes", label: "Minutes" }]}
      valueFormat={(value) => `${value} min`}
      className="h-56"
    />
  );
}
