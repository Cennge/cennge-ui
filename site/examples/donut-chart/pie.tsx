"use client";

import { DonutChart } from "cennge-ui/charts";

const results = [
  { result: "Passed", runs: 1184 },
  { result: "Failed", runs: 63 },
  { result: "Cancelled", runs: 41 },
];

export default function RunsByResult() {
  return (
    <DonutChart
      aria-label="CI runs in October by result"
      data={results}
      index="result"
      value="runs"
      indexLabel="Result"
      valueLabel="Runs"
      variant="pie"
      colors={["success", "danger", "default"]}
    />
  );
}
