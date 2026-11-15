"use client";

import { AreaChart } from "cennge-ui/charts";

const hours = [
  { hour: "06:00", scans: 0 },
  { hour: "08:00", scans: 140 },
  { hour: "10:00", scans: 410 },
  { hour: "12:00", scans: 410 },
  { hour: "14:00", scans: 380 },
  { hour: "16:00", scans: 520 },
  { hour: "18:00", scans: 260 },
  { hour: "20:00", scans: 0 },
  { hour: "22:00", scans: 0 },
];

export default function ScreenerScans() {
  return (
    <AreaChart
      aria-label="Screener scans every two hours"
      data={hours}
      index="hour"
      indexLabel="Hour"
      curve="smooth"
      series={[{ key: "scans", label: "Scans" }]}
      className="h-56"
    />
  );
}
