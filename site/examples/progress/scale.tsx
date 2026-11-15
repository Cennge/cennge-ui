"use client";

import { Progress } from "cennge-ui";

const count = (value: number) => value.toLocaleString("en-US");

export default function ProgressScale() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Progress
        label="Release assets"
        value={3}
        max={8}
        formatValue={(value, max) => `${value} of ${max} uploaded`}
      />
      <Progress
        label="Actions minutes this month"
        value={1540}
        max={2000}
        color="warning"
        size="lg"
        formatValue={(value, max) => `${count(value)} of ${count(max)}`}
      />
    </div>
  );
}
