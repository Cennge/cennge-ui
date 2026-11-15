"use client";

import { Slider } from "cennge-ui";

const jobs = [1, 2, 4, 8, 16].map((value) => ({ value, label: String(value) }));

export default function ParallelJobs() {
  return (
    <Slider
      label="Parallel jobs"
      defaultValue={4}
      min={1}
      max={16}
      marks={jobs}
      restrictToMarks
      color="secondary"
      className="w-full max-w-96"
    />
  );
}
