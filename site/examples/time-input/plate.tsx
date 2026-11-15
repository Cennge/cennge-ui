"use client";

import { useState } from "react";
import { TimeInput } from "cennge-ui";

export default function TimeInputPlate() {
  const [call, setCall] = useState<string | null>("14:30");
  const [nightly, setNightly] = useState<string | null>("02:30");

  return (
    <div className="grid w-full max-w-96 gap-x-4 gap-y-5 sm:grid-cols-2">
      <TimeInput
        label="Release call"
        description="Between 9 AM and 6 PM"
        step={15}
        minValue="09:00"
        maxValue="18:00"
        value={call}
        onValueChange={setCall}
      />
      <TimeInput
        label="Nightly build"
        description="On a 24-hour clock"
        hourCycle={24}
        value={nightly}
        onValueChange={setNightly}
      />
      <p className="text-sm text-muted sm:col-span-2">
        Both values are <code className="font-code text-foreground">"HH:mm"</code>:{" "}
        <code className="font-code text-foreground">{call ? `"${call}"` : "null"}</code> and{" "}
        <code className="font-code text-foreground">{nightly ? `"${nightly}"` : "null"}</code>
      </p>
    </div>
  );
}
