"use client";

import { DonutChart } from "cennge-ui/charts";

const failed = [
  { repository: "cennge-ui", runs: 0 },
  { repository: "payload-cache", runs: 0 },
  { repository: "ai-niche-scout", runs: 0 },
];

export default function FailedRuns() {
  return (
    <DonutChart
      aria-label="Failed CI runs this week by repository"
      data={failed}
      index="repository"
      value="runs"
      indexLabel="Repository"
      valueLabel="Failed runs"
      emptyContent="No failed runs this week"
    />
  );
}
