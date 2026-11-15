"use client";

import { useState } from "react";
import { DateRangePicker, type DateRange } from "cennge-ui";

export default function Sprint() {
  const [sprint, setSprint] = useState<DateRange | null>(null);

  return (
    <div className="flex w-full max-w-80 flex-col gap-3">
      <DateRangePicker label="Sprint" value={sprint} onValueChange={setSprint} />
      <p className="text-sm text-muted">
        value: <code className="font-code text-foreground">{sprint ? JSON.stringify(sprint) : "null"}</code>
      </p>
    </div>
  );
}
