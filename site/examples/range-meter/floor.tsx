"use client";

import { RangeMeter } from "cennge-ui";

export default function CoverageFloor() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <RangeMeter label="cennge-ui, test coverage" value={91} low={80} max={100} unit="%" />
      <RangeMeter label="payload-cache, test coverage" value={64} low={80} max={100} unit="%" />
    </div>
  );
}
