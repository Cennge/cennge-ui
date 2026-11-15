"use client";

import { RangeMeter } from "cennge-ui";

export default function BundleBudget() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <RangeMeter label="Button, gzip" value={2.1} high={3} unit="KB" />
      <RangeMeter label="Select, gzip" value={6.4} high={5} unit="KB" />
    </div>
  );
}
