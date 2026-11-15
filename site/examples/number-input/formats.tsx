"use client";

import { NumberInput } from "cennge-ui";

export default function NumberFormats() {
  return (
    <div className="flex w-full max-w-2xl flex-wrap gap-5">
      <NumberInput
        label="Monthly budget"
        defaultValue={1200}
        min={0}
        step={100}
        formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
        className="min-w-44 flex-1"
      />
      <NumberInput
        label="Cache size"
        defaultValue={512}
        min={64}
        max={4096}
        step={64}
        formatOptions={{ style: "unit", unit: "megabyte" }}
        className="min-w-44 flex-1"
      />
      <NumberInput
        label="Sample rate"
        defaultValue={0.25}
        min={0}
        max={1}
        step={0.05}
        formatOptions={{ style: "percent" }}
        className="min-w-44 flex-1"
      />
    </div>
  );
}
