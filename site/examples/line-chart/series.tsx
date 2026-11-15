"use client";

import { LineChart } from "cennge-ui/charts";

const months = [
  { month: "May", opened: 26, merged: 19, closed: 4 },
  { month: "Jun", opened: 31, merged: 27, closed: 3 },
  { month: "Jul", opened: 29, merged: 30, closed: 6 },
  { month: "Aug", opened: 38, merged: 29, closed: 5 },
  { month: "Sep", opened: 42, merged: 40, closed: 2 },
  { month: "Oct", opened: 36, merged: 41, closed: 4 },
];

export default function PullRequests() {
  return (
    <LineChart
      aria-label="Pull requests in cennge-ui per month"
      data={months}
      index="month"
      indexLabel="Month"
      series={[
        { key: "opened", label: "Opened" },
        { key: "merged", label: "Merged" },
        { key: "closed", label: "Closed unmerged" },
      ]}
      className="h-64"
    />
  );
}
