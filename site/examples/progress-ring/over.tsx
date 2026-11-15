"use client";

import { ProgressRing } from "cennge-ui";

const weeks = [
  { week: "This week", commits: 52 },
  { week: "Last week", commits: 40 },
  { week: "Two weeks ago", commits: 23 },
];

export default function CommitStreak() {
  return (
    <div className="flex flex-wrap items-start gap-10">
      {weeks.map(({ week, commits }) => (
        <div key={week} className="flex flex-col items-center gap-3">
          <ProgressRing aria-label={`Commits, ${week.toLowerCase()}`} value={commits} max={40} size="md">
            <span className="text-lg font-semibold">{commits}</span>
          </ProgressRing>
          <span className="text-sm text-muted">{week}</span>
        </div>
      ))}
    </div>
  );
}
