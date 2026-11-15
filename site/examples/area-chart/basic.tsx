"use client";

import { AreaChart } from "cennge-ui/charts";

const months = [
  { month: "Mar", minutes: 1700 },
  { month: "Apr", minutes: 1810 },
  { month: "May", minutes: 2040 },
  { month: "Jun", minutes: 2250 },
  { month: "Jul", minutes: 2340 },
  { month: "Aug", minutes: 2370 },
  { month: "Sep", minutes: 2700 },
  { month: "Oct", minutes: 2840 },
];

export default function CiMinutes() {
  return (
    <AreaChart
      aria-label="CI minutes per month"
      data={months}
      index="month"
      indexLabel="Month"
      series={[{ key: "minutes", label: "Minutes" }]}
      className="h-56"
    />
  );
}
