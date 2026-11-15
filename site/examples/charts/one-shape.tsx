"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "cennge-ui";
import { AreaChart, BarChart, LineChart, type CartesianChartProps } from "cennge-ui/charts";

const months = [
  { month: "May", opened: 18, closed: 12 },
  { month: "Jun", opened: 24, closed: 22 },
  { month: "Jul", opened: 31, closed: 26 },
  { month: "Aug", opened: 27, closed: 30 },
  { month: "Sep", opened: 35, closed: 33 },
  { month: "Oct", opened: 29, closed: 34 },
];

const chart: CartesianChartProps<(typeof months)[number]> = {
  "aria-label": "Issues in cennge-ui per month",
  data: months,
  index: "month",
  indexLabel: "Month",
  series: [
    { key: "opened", label: "Opened" },
    { key: "closed", label: "Closed" },
  ],
  className: "h-64",
};

export default function OneShape() {
  const [kind, setKind] = useState("bar");
  return (
    <div className="flex w-full flex-col gap-4">
      <ToggleGroup aria-label="Chart" size="sm" value={kind} onValueChange={(value) => value && setKind(value)}>
        <ToggleGroupItem value="bar">BarChart</ToggleGroupItem>
        <ToggleGroupItem value="line">LineChart</ToggleGroupItem>
        <ToggleGroupItem value="area">AreaChart</ToggleGroupItem>
      </ToggleGroup>
      {kind === "bar" ? <BarChart {...chart} /> : kind === "line" ? <LineChart {...chart} /> : <AreaChart {...chart} />}
    </div>
  );
}
