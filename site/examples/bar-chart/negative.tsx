"use client";

import { BarChart } from "cennge-ui/charts";

const weeks = [
  { week: "Sep 14", change: 5 },
  { week: "Sep 21", change: -3 },
  { week: "Sep 28", change: 2 },
  { week: "Oct 5", change: -8 },
  { week: "Oct 12", change: -4 },
  { week: "Oct 19", change: 1 },
  { week: "Oct 26", change: -6 },
  { week: "Nov 2", change: -2 },
];

const signed = new Intl.NumberFormat("en-US", { signDisplay: "exceptZero" });

export default function OpenIssuesChange() {
  return (
    <BarChart
      aria-label="Change in open issues per week"
      data={weeks}
      index="week"
      indexLabel="Week of"
      series={[{ key: "change", label: "Open issues" }]}
      domain={[-10, 10]}
      valueFormat={(value) => signed.format(value)}
      className="h-56"
    />
  );
}
