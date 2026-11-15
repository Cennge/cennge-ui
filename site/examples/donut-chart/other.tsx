"use client";

import { DonutChart } from "cennge-ui/charts";

const disk = [
  { kind: "Pages", megabytes: 412 },
  { kind: "Media", megabytes: 139 },
  { kind: "Search index", megabytes: 61 },
  { kind: "Logs", megabytes: 33 },
  { kind: "Other", megabytes: 19 },
];

export default function DiskUse() {
  return (
    <DonutChart
      aria-label="Disk used by payload-cache"
      data={disk}
      index="kind"
      value="megabytes"
      indexLabel="Kind"
      valueLabel="Size"
      colors={["chart-1", "chart-2", "chart-3", "chart-4", "default"]}
      valueFormat={(megabytes) => `${megabytes} MB`}
      labels={{ total: "Used" }}
    />
  );
}
