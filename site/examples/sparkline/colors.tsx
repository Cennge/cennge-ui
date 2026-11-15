"use client";

import { Sparkline } from "cennge-ui/charts";

const trends = [
  {
    name: "Failed runs a day",
    now: "2",
    change: "down from 9",
    data: [9, 7, 8, 6, 5, 6, 4, 3, 4, 2],
    color: "success",
  },
  {
    name: "p95 response time",
    now: "301 ms",
    change: "up from 212 ms",
    data: [212, 205, 219, 231, 228, 246, 263, 270, 287, 301],
    color: "danger",
  },
] as const;

export default function GoodAndBad() {
  return (
    <ul className="flex w-full max-w-md flex-col gap-3">
      {trends.map((trend) => (
        <li key={trend.name} className="flex items-center gap-4 text-sm">
          <span className="min-w-0 flex-1">
            <span className="block font-medium">{trend.name}</span>
            <span className="text-muted">{trend.change}</span>
          </span>
          <Sparkline
            aria-label={`${trend.name}, ${trend.change} to ${trend.now}`}
            data={trend.data}
            color={trend.color}
            className="h-8 w-28"
          />
          <span className="w-16 text-right font-semibold tabular-nums">{trend.now}</span>
        </li>
      ))}
    </ul>
  );
}
