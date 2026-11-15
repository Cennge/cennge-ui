"use client";

import { BarChart } from "cennge-ui/charts";

// Gzip size of each import on its own, Radix and the other dependencies aside.
const sizes = [
  { name: "Popover", kb: 0.7 },
  { name: "Dialog", kb: 1.7 },
  { name: "Button", kb: 2.2 },
  { name: "Table", kb: 2.4 },
  { name: "Select", kb: 4.0 },
  { name: "Combobox", kb: 6.8 },
  { name: "DatePicker", kb: 10.2 },
];

export default function ImportSizes() {
  return (
    <BarChart
      aria-label="Gzip size of each import, in KB"
      data={sizes}
      index="name"
      series={[{ key: "kb", label: "KB gzip" }]}
      layout="horizontal"
      showLegend={false}
      valueFormat={(value) => `${value.toFixed(1)} KB`}
      className="h-80"
    />
  );
}
