"use client";

import { useState } from "react";
import { DateRangePicker, type DateRange } from "cennge-ui";

// No releases over the holidays: a range cannot run across these days.
const isFrozen = (iso: string) => iso >= "2026-12-21" && iso <= "2027-01-03";

function count({ start, end }: DateRange) {
  let days = 0;
  let weekdays = 0;
  for (let day = new Date(`${start}T00:00:00Z`); day <= new Date(`${end}T00:00:00Z`); day.setUTCDate(day.getUTCDate() + 1)) {
    days += 1;
    if (day.getUTCDay() !== 0 && day.getUTCDay() !== 6) weekdays += 1;
  }
  return { days, weekdays };
}

export default function DateRangePickerPlate() {
  const [beta, setBeta] = useState<DateRange | null>({ start: "2026-11-23", end: "2026-12-11" });

  return (
    <div className="flex w-full max-w-80 flex-col gap-4">
      <DateRangePicker
        label="ai-niche-scout beta"
        description="Frozen from December 21 to January 3"
        value={beta}
        onValueChange={setBeta}
        isDateUnavailable={isFrozen}
      />
      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-medium bg-surface-3 px-3 py-2">
          <dt className="text-xs text-muted">Days</dt>
          <dd className="text-lg font-semibold tabular-nums">{beta ? count(beta).days : "–"}</dd>
        </div>
        <div className="rounded-medium bg-surface-3 px-3 py-2">
          <dt className="text-xs text-muted">Working days</dt>
          <dd className="text-lg font-semibold tabular-nums">{beta ? count(beta).weekdays : "–"}</dd>
        </div>
      </dl>
    </div>
  );
}
