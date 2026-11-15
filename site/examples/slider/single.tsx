"use client";

import { useState } from "react";
import { Slider } from "cennge-ui";

export default function TimeoutSlider() {
  const [seconds, setSeconds] = useState(30);
  const [saved, setSaved] = useState(30);

  return (
    <div className="flex w-full max-w-96 flex-col gap-3">
      <Slider
        label="Request timeout"
        value={seconds}
        onValueChange={setSeconds}
        onValueCommit={setSaved}
        min={5}
        max={120}
        step={5}
        formatValue={(value) => `${value} s`}
      />
      <p className="text-sm text-muted">Saved: {saved} s</p>
    </div>
  );
}
