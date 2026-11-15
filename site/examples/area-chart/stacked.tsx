"use client";

import { AreaChart } from "cennge-ui/charts";

const weeks = [
  { week: "Aug 17", passed: 52, flaky: 4, failed: 6 },
  { week: "Aug 24", passed: 58, flaky: 3, failed: 4 },
  { week: "Aug 31", passed: 55, flaky: 6, failed: 7 },
  { week: "Sep 7", passed: 61, flaky: 5, failed: 3 },
  { week: "Sep 14", passed: 64, flaky: 2, failed: 5 },
  { week: "Sep 21", passed: 59, flaky: 4, failed: 8 },
  { week: "Sep 28", passed: 68, flaky: 3, failed: 4 },
  { week: "Oct 5", passed: 71, flaky: 5, failed: 3 },
  { week: "Oct 12", passed: 66, flaky: 2, failed: 6 },
  { week: "Oct 19", passed: 74, flaky: 3, failed: 2 },
  { week: "Oct 26", passed: 79, flaky: 1, failed: 3 },
  { week: "Nov 2", passed: 83, flaky: 2, failed: 2 },
];

export default function CiRunsByResult() {
  return (
    <AreaChart
      aria-label="CI runs per week by result"
      data={weeks}
      index="week"
      indexLabel="Week of"
      isStacked
      series={[
        { key: "passed", label: "Passed", color: "success" },
        { key: "flaky", label: "Flaky", color: "warning" },
        { key: "failed", label: "Failed", color: "danger" },
      ]}
      className="h-64"
    />
  );
}
