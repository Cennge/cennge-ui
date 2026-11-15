"use client";

import { BarChart } from "cennge-ui/charts";

const runs = [
  { day: "Mon", runs: 14 },
  { day: "Tue", runs: 22 },
  { day: "Wed", runs: 18 },
  { day: "Thu", runs: 25 },
  { day: "Fri", runs: 19 },
  { day: "Sat", runs: 4 },
  { day: "Sun", runs: 2 },
];

export default function CiRunsPerDay() {
  return (
    <BarChart
      aria-label="CI runs of cennge-ui per day"
      data={runs}
      index="day"
      indexLabel="Day"
      series={[{ key: "runs", label: "Runs" }]}
      className="h-56"
    />
  );
}
