"use client";

import { useState } from "react";
import { Calendar } from "cennge-ui";

// Releases go out on weekdays.
const isWeekend = (iso: string) => {
  const day = new Date(`${iso}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
};

const longDate = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });

export default function CalendarPlate() {
  const [release, setRelease] = useState("2026-11-19");

  return (
    <div className="flex flex-wrap items-start gap-x-6 gap-y-5">
      <Calendar aria-label="Release date" value={release} onValueChange={setRelease} isDateUnavailable={isWeekend} />
      <div className="flex w-36 flex-col gap-1 pt-1">
        <span className="text-[13px] font-medium text-muted">cennge-ui 0.4.0</span>
        <span className="font-semibold text-balance">Ships {longDate.format(new Date(`${release}T00:00:00Z`))}</span>
        <code className="mt-2 w-fit rounded-small bg-surface-3 px-1.5 py-0.5 font-code text-[12.5px]">"{release}"</code>
      </div>
    </div>
  );
}
