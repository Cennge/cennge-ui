"use client";

import { BarChart } from "cennge-ui/charts";

const weeks = [
  { week: "Sep 14", passed: 58, failed: 6 },
  { week: "Sep 21", passed: 64, failed: 4 },
  { week: "Sep 28", passed: 71, failed: 9 },
  { week: "Oct 5", passed: 66, failed: 3 },
  { week: "Oct 12", passed: 80, failed: 5 },
  { week: "Oct 19", passed: 77, failed: 2 },
  { week: "Oct 26", passed: 85, failed: 4 },
  { week: "Nov 2", passed: 90, failed: 3 },
];

export default function CiRunsByResult() {
  return (
    <BarChart
      aria-label="CI runs per week by result"
      data={weeks}
      index="week"
      indexLabel="Week of"
      isStacked
      series={[
        { key: "passed", label: "Passed", color: "success" },
        { key: "failed", label: "Failed", color: "danger" },
      ]}
      className="h-64"
    />
  );
}
