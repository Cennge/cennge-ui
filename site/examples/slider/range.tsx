"use client";

import { useState } from "react";
import { Slider } from "cennge-ui";

export default function ChangedLinesFilter() {
  const [lines, setLines] = useState([50, 400]);
  const [from = 0, to = 1000] = lines;

  return (
    <div className="flex w-full max-w-96 flex-col gap-3">
      <Slider label="Changed lines" value={lines} onValueChange={setLines} min={0} max={1000} step={10} />
      <p className="text-sm text-muted">
        Pull requests that change {from} to {to} lines
      </p>
    </div>
  );
}
