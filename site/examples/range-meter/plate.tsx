"use client";

import { useState } from "react";
import { Button, RangeMeter } from "cennge-ui";

export default function RangeMeterPlate() {
  const [minutes, setMinutes] = useState(1940);

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <RangeMeter label="Test coverage" value={76} low={80} max={100} unit="%" />
      <RangeMeter label="Build time" value={48} low={30} high={60} unit="s" />
      <RangeMeter label="CI minutes this month" value={minutes} high={2000} unit="min" />
      <div className="flex gap-2">
        <Button size="sm" variant="flat" onClick={() => setMinutes((value) => value + 120)}>
          Run the e2e suite
        </Button>
        <Button size="sm" variant="light" onClick={() => setMinutes(1940)}>
          Reset
        </Button>
      </div>
    </div>
  );
}
