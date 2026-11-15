"use client";

import { useState } from "react";
import { DatePicker } from "cennge-ui";

const DAY = 24 * 60 * 60 * 1000;

function plan(freeze: string | null, release: string | null) {
  if (!freeze || !release) return "Pick both dates to plan cennge-ui 0.4.0.";
  const days = (Date.parse(`${release}T00:00:00Z`) - Date.parse(`${freeze}T00:00:00Z`)) / DAY;
  if (days < 0) return "The release is set before the code freeze.";
  return `cennge-ui 0.4.0 ships ${days} ${days === 1 ? "day" : "days"} after the code freeze.`;
}

const isWeekend = (iso: string) => {
  const day = new Date(`${iso}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
};

export default function DatePickerPlate() {
  const [freeze, setFreeze] = useState<string | null>("2026-11-13");
  const [release, setRelease] = useState<string | null>("2026-11-19");

  return (
    <div className="grid w-full max-w-96 gap-x-4 gap-y-5 sm:grid-cols-2">
      <DatePicker label="Code freeze" description="Last day for merges" value={freeze} onValueChange={setFreeze} />
      <DatePicker
        label="Release"
        description="A weekday, not before the freeze"
        value={release}
        onValueChange={setRelease}
        minValue={freeze}
        isDateUnavailable={isWeekend}
      />
      <p className="text-sm text-muted sm:col-span-2">{plan(freeze, release)}</p>
    </div>
  );
}
