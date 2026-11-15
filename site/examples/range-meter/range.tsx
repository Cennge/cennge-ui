"use client";

import { RangeMeter } from "cennge-ui";

const runs = [
  { name: "ai-niche-scout", seconds: 22 },
  { name: "cennge-ui", seconds: 48 },
  { name: "spredo-crypto-screener", seconds: 71 },
];

export default function BuildTimes() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {runs.map((run) => (
        <RangeMeter key={run.name} label={`${run.name}, build`} value={run.seconds} low={30} high={60} max={90} unit="s" />
      ))}
    </div>
  );
}
