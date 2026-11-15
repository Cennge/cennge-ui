"use client";

import { LineChart } from "cennge-ui/charts";

const weeks = [
  { week: "Aug 17", open: 31 },
  { week: "Aug 24", open: 34 },
  { week: "Aug 31", open: 33 },
  { week: "Sep 7", open: 38 },
  { week: "Sep 14", open: 36 },
  { week: "Sep 21", open: 29 },
  { week: "Sep 28", open: 27 },
  { week: "Oct 5", open: 30 },
  { week: "Oct 12", open: 24 },
  { week: "Oct 19", open: 22 },
  { week: "Oct 26", open: 23 },
  { week: "Nov 2", open: 19 },
];

export default function OpenIssues() {
  return (
    <LineChart
      aria-label="Open issues in ai-niche-scout per week"
      data={weeks}
      index="week"
      indexLabel="Week of"
      series={[{ key: "open", label: "Open issues" }]}
      className="h-56"
    />
  );
}
