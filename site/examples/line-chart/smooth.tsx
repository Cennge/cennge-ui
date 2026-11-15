"use client";

import { LineChart } from "cennge-ui/charts";

const days = [
  { day: "Mon", failed: 0 },
  { day: "Tue", failed: 3 },
  { day: "Wed", failed: 0 },
  { day: "Thu", failed: 0 },
  { day: "Fri", failed: 5 },
  { day: "Sat", failed: 1 },
  { day: "Sun", failed: 0 },
];

export default function FailedRuns() {
  return (
    <LineChart
      aria-label="Failed CI runs per day"
      data={days}
      index="day"
      indexLabel="Day"
      curve="smooth"
      series={[{ key: "failed", label: "Failed runs", color: "danger" }]}
      className="h-48"
    />
  );
}
