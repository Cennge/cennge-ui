"use client";

import { useState } from "react";
import { ProgressRing, ToggleGroup, ToggleGroupItem } from "cennge-ui";

const goals = [
  { label: "Commits", value: 34, max: 40, color: "chart-1" },
  { label: "Reviews", value: 9, max: 6, color: "chart-2" },
  { label: "Deploys", value: 2, max: 5, color: "chart-3" },
] as const;

const minutes = { used: 1820, budget: 2000 };

export default function ProgressRingPlate() {
  const [shown, setShown] = useState("left");
  const left = minutes.budget - minutes.used;

  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-x-14 gap-y-10">
      <div className="flex flex-wrap items-center gap-8">
        <ProgressRing aria-label="cennge-ui this week" rings={goals} size="xl" />
        <ul className="flex flex-col gap-3">
          {goals.map((goal) => (
            <li key={goal.label} className="flex flex-col">
              <span className="flex items-center gap-2 text-sm text-muted">
                <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: `var(--cennge-${goal.color})` }} />
                {goal.label}
              </span>
              <span className="pl-4.5 text-lg font-semibold tabular-nums">
                {goal.value} <span className="text-sm font-normal text-muted">/ {goal.max}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col items-center gap-4">
        <ProgressRing
          aria-label="CI minutes this month"
          value={minutes.used}
          max={minutes.budget}
          formatValue={(used, budget) => `${used.toLocaleString("en-US")} of ${budget.toLocaleString("en-US")} minutes, ${(budget - used).toLocaleString("en-US")} left`}
          size="lg"
        >
          <span className="text-2xl font-semibold">{(shown === "left" ? left : minutes.used).toLocaleString("en-US")}</span>
          <span className="text-xs text-muted">{shown === "left" ? "minutes left" : "minutes used"}</span>
        </ProgressRing>
        <ToggleGroup aria-label="Show" size="sm" value={shown} onValueChange={(value) => value && setShown(value)}>
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="used">Used</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
