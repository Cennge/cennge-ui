"use client";

import { useEffect, useState } from "react";
import { DatePicker } from "cennge-ui";

export default function DateFix() {
  const [release, setRelease] = useState<string | null>(null);
  // Only the browser knows the reader's today; until then null means no limit.
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(new Date().toLocaleDateString("sv-SE")), []);

  return (
    <div className="w-full max-w-72">
      <DatePicker
        label="Release date"
        description="Today or later"
        value={release}
        onValueChange={setRelease}
        minValue={today}
      />
    </div>
  );
}
