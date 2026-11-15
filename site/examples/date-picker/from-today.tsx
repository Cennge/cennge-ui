"use client";

import { useEffect, useState } from "react";
import { DatePicker } from "cennge-ui";

const toIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const isWeekend = (iso: string) => {
  const day = new Date(`${iso}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
};

export default function DueDate() {
  // Today is the browser's, so it is read after mount; until then null means no limit.
  const [limits, setLimits] = useState<{ min: string; max: string } | null>(null);
  useEffect(() => {
    const now = new Date();
    const inNinetyDays = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 90);
    setLimits({ min: toIso(now), max: toIso(inNinetyDays) });
  }, []);

  return (
    <DatePicker
      label="Due date"
      description="A weekday in the next 90 days"
      minValue={limits?.min ?? null}
      maxValue={limits?.max ?? null}
      isDateUnavailable={isWeekend}
      className="w-full max-w-64"
    />
  );
}
