"use client";

import { useState } from "react";
import { Slider } from "cennge-ui";

const hour = (value: number) => `${String(value).padStart(2, "0")}:00`;
const hours = [0, 6, 12, 18, 24].map((value) => ({ value, label: hour(value) }));
const jobs = [1, 2, 4, 8, 16].map((value) => ({ value, label: String(value) }));
const percents = [0, 25, 50, 75, 100].map((value) => ({ value, label: `${value}%` }));

export default function SliderPlate() {
  const [deployWindow, setDeployWindow] = useState([9, 18]);
  const [parallel, setParallel] = useState(4);
  const [coverage, setCoverage] = useState(80);
  const [from = 0, to = 24] = deployWindow;

  return (
    <div className="flex w-full max-w-xl flex-col gap-7">
      <Slider
        label="Deploy window"
        value={deployWindow}
        onValueChange={setDeployWindow}
        min={0}
        max={24}
        marks={hours}
        formatValue={hour}
        thumbLabels={["start", "end"]}
      />
      <Slider label="Parallel jobs" value={parallel} onValueChange={setParallel} min={1} max={16} marks={jobs} restrictToMarks />
      <Slider
        label="Coverage threshold"
        value={coverage}
        onValueChange={setCoverage}
        marks={percents}
        formatValue={(value) => `${value}%`}
      />
      <p className="rounded-medium bg-surface-3 px-4 py-3 text-sm">
        cennge-ui deploys between {hour(from)} and {hour(to)}, runs {parallel} {parallel === 1 ? "job" : "jobs"} at a time and
        fails a build under {coverage}% coverage.
      </p>
    </div>
  );
}
