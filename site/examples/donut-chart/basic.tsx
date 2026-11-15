"use client";

import { DonutChart } from "cennge-ui/charts";

const labels = [
  { label: "bug", issues: 3 },
  { label: "enhancement", issues: 8 },
  { label: "documentation", issues: 4 },
  { label: "question", issues: 2 },
];

export default function OpenIssuesByLabel() {
  return (
    <DonutChart
      aria-label="Open issues in cennge-ui by label"
      data={labels}
      index="label"
      value="issues"
      indexLabel="Label"
      valueLabel="Open issues"
      labels={{ total: "Open issues" }}
    />
  );
}
