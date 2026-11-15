"use client";

import { useState } from "react";
import { TimeInput } from "cennge-ui";

export default function DeployTime() {
  const [time, setTime] = useState<string | null>(null);

  return (
    <div className="flex w-full max-w-56 flex-col gap-3">
      <TimeInput label="Deploy at" value={time} onValueChange={setTime} />
      <p className="text-sm text-muted">
        value: <code className="font-code text-foreground">{time ? `"${time}"` : "null"}</code>
      </p>
    </div>
  );
}
