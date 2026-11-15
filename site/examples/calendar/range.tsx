"use client";

import { useState } from "react";
import { RangeCalendar, type DateRange } from "cennge-ui";

const DAY = 24 * 60 * 60 * 1000;
const utc = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const days = ({ start, end }: DateRange) => (utc(end) - utc(start)) / DAY + 1;

export default function BetaPeriod() {
  const [beta, setBeta] = useState<DateRange | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <RangeCalendar
        aria-label="Beta period"
        visibleMonths={2}
        defaultFocusedValue="2026-11-01"
        value={beta}
        onValueChange={setBeta}
      />
      <p className="text-sm text-muted">
        {beta
          ? `ai-niche-scout beta: ${beta.start} to ${beta.end}, ${days(beta)} days`
          : "Pick the first and the last day"}
      </p>
    </div>
  );
}
