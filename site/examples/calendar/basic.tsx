"use client";

import { useState } from "react";
import { Calendar } from "cennge-ui";

// The value has no time zone: format it in UTC, or the day can shift.
const fullDate = new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeZone: "UTC" });

export default function ReleaseDate() {
  const [date, setDate] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <Calendar aria-label="Release date" value={date} onValueChange={setDate} />
      <p className="text-sm text-muted">
        {date ? `payload-cache 1.4.0: ${fullDate.format(new Date(`${date}T00:00:00Z`))}` : "No release date yet"}
      </p>
    </div>
  );
}
