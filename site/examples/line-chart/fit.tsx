"use client";

import { LineChart } from "cennge-ui/charts";

const days = [
  { day: "Mon", hits: 94.2 },
  { day: "Tue", hits: 95.1 },
  { day: "Wed", hits: 93.8 },
  { day: "Thu", hits: 96 },
  { day: "Fri", hits: 96.4 },
  { day: "Sat", hits: 92.7 },
  { day: "Sun", hits: 93.5 },
];

const percent = (value: number) => `${value}%`;

export default function CacheHitRate() {
  return (
    <LineChart
      aria-label="payload-cache hit rate per day"
      data={days}
      index="day"
      indexLabel="Day"
      series={[{ key: "hits", label: "Hit rate" }]}
      startAtZero={false}
      showDots
      valueFormat={percent}
      axisFormat={percent}
      // The dots sit in a ring of the colour behind the chart.
      className="h-56 [--cennge-chart-surface:var(--cennge-surface-2)]"
    />
  );
}
