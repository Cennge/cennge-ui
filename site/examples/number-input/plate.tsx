"use client";

import { NumberInput } from "cennge-ui";

export default function CiSettings() {
  return (
    <div className="grid w-full max-w-lg gap-5 sm:grid-cols-2">
      <NumberInput label="Parallel jobs" defaultValue={4} min={1} max={16} description="1 to 16" />
      <NumberInput label="Timeout" defaultValue={30} min={5} max={120} step={5} formatOptions={{ style: "unit", unit: "minute" }} description="In steps of 5" />
      <NumberInput label="Coverage threshold" defaultValue={0.8} min={0} max={1} formatOptions={{ style: "percent" }} />
      <NumberInput label="Retries" defaultValue={0} min={0} max={3} description="0 to 3" />
    </div>
  );
}
