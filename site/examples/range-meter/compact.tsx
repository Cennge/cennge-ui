"use client";

import { RangeMeter } from "cennge-ui";

const limits = [
  { name: "Requests this hour", used: 3120, limit: 5000 },
  { name: "Cache entries", used: 41_800, limit: 50_000 },
  { name: "Webhooks today", used: 212, limit: 200 },
];

export default function ApiLimits() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      {limits.map((limit) => (
        <RangeMeter key={limit.name} label={limit.name} value={limit.used} high={limit.limit} size="sm" showStatus={false} />
      ))}
    </div>
  );
}
