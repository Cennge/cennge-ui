"use client";

import { LineChart, movingAverage } from "cennge-ui/charts";

const seconds = [52, 49, 61, 47, 55, 58, 44, 51, 63, 48, 46, 50, 45, 42, 47, 41, 44, 39, 43, 40, 38];
const average = movingAverage(seconds, 7);
const builds = seconds.map((value, i) => ({
  day: `Oct ${i + 1}`,
  build: value,
  average: average[i] === null ? null : Math.round(average[i]! * 10) / 10,
}));

export default function BuildTrend() {
  return (
    <LineChart
      aria-label="cennge-ui build time a day in October, seconds"
      data={builds}
      index="day"
      series={[
        { key: "build", label: "Build", display: "dots" },
        { key: "average", label: "7-day average" },
      ]}
      startAtZero={false}
      references={[{ from: 30, to: 45, label: "Target", color: "success" }]}
      valueFormat={(value) => `${value} s`}
      className="h-64"
    />
  );
}
