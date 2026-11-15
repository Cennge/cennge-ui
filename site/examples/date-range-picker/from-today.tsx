"use client";

import { useEffect, useState } from "react";
import { DateRangePicker } from "cennge-ui";

const toIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function DeployWindow() {
  // Today is the browser's, so it is read after mount; until then null means no limit.
  const [limits, setLimits] = useState<{ min: string; max: string } | null>(null);
  useEffect(() => {
    const now = new Date();
    const later = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 120);
    setLimits({ min: toIso(now), max: toIso(later) });
  }, []);

  return (
    <DateRangePicker
      label="Deploy window"
      description="Within the next 120 days"
      minValue={limits?.min ?? null}
      maxValue={limits?.max ?? null}
      className="w-full max-w-80"
    />
  );
}
