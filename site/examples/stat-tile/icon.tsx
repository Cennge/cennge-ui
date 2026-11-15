"use client";

import { StatTile } from "cennge-ui";

const percent = new Intl.NumberFormat("en-US", { style: "percent", signDisplay: "exceptZero" });

function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Uptime() {
  return (
    <StatTile
      label="payload-cache, p95 latency"
      icon={<ClockIcon />}
      value={184}
      unit="ms"
      delta={-0.12}
      formatDelta={(change) => percent.format(change)}
      goodDirection="down"
      deltaLabel="after the cache warm-up fix"
      variant="bordered"
      className="w-full max-w-72"
    />
  );
}
