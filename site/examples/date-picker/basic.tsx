"use client";

import { useState } from "react";
import { DatePicker } from "cennge-ui";

export default function ReleaseDate() {
  const [date, setDate] = useState<string | null>(null);

  return (
    <div className="flex w-full max-w-64 flex-col gap-3">
      <DatePicker label="Release date" value={date} onValueChange={setDate} />
      <p className="text-sm text-muted">
        value: <code className="font-code text-foreground">{date ? `"${date}"` : "null"}</code>
      </p>
    </div>
  );
}
