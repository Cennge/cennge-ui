"use client";

import { useState } from "react";
import { TimeInput } from "cennge-ui";

export default function Clocks() {
  const [time, setTime] = useState<string | null>("21:45");

  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      <TimeInput label="en-US" locale="en-US" value={time} onValueChange={setTime} />
      <TimeInput label="en-GB" locale="en-GB" value={time} onValueChange={setTime} />
      <TimeInput label="en-US, 24 hours" locale="en-US" hourCycle={24} value={time} onValueChange={setTime} />
    </div>
  );
}
