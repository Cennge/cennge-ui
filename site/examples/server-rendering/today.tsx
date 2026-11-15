"use client";

import { useEffect, useState } from "react";
import { Calendar } from "cennge-ui";

/** Today in the reader's time zone, as "2026-11-08". Null until the page hydrates. */
function useToday() {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    setToday(`${now.getFullYear()}-${month}-${day}`);
  }, []);
  return today;
}

export default function ReleaseDay() {
  const today = useToday();
  const [release, setRelease] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <Calendar aria-label="Release day" value={release} onValueChange={setRelease} minValue={today} />
      <p className="text-sm text-muted">{release ? `Releases on ${release}` : "Pick a day from today on"}</p>
    </div>
  );
}
