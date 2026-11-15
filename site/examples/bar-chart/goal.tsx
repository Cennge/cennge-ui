"use client";

import { BarChart } from "cennge-ui/charts";

const days = [
  { day: "Mon", commits: 7 },
  { day: "Tue", commits: 4 },
  { day: "Wed", commits: 9 },
  { day: "Thu", commits: 5 },
  { day: "Fri", commits: 6 },
  { day: "Sat", commits: 1 },
  { day: "Sun", commits: 2 },
];

export default function CommitGoal() {
  return (
    <BarChart
      aria-label="Commits a day to cennge-ui this week"
      data={days}
      index="day"
      series={[{ key: "commits", label: "Commits" }]}
      references={[{ value: 6, label: "Goal 6 a day" }]}
      className="h-56"
    />
  );
}
