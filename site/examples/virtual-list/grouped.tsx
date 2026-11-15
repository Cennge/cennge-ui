"use client";

import { VirtualList } from "cennge-ui";

type Row =
  | { kind: "day"; label: string }
  | { kind: "deploy"; repository: string; environment: "production" | "preview"; time: string };

const repositories = ["cennge-ui", "ai-niche-scout", "payload-cache", "spredo-crypto-screener", "playwright-msi-scraper"];
const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

// A year of deploys, newest first, each day under a heading row.
const rows: Row[] = Array.from({ length: 365 }, (_, dayIndex): Row[] => [
  { kind: "day", label: dayName.format(Date.UTC(2026, 10, 8 - dayIndex)) },
  ...Array.from({ length: 3 + (dayIndex % 4) }, (_, n): Row => ({
    kind: "deploy",
    repository: repositories[(dayIndex + n) % repositories.length]!,
    environment: (dayIndex + n) % 3 ? "preview" : "production",
    time: `${String(20 - n * 3).padStart(2, "0")}:${String((dayIndex * 7 + n * 13) % 60).padStart(2, "0")}`,
  })),
]).flat();

export default function DeploysByDay() {
  return (
    <VirtualList
      items={rows}
      estimateSize={(index) => (rows[index]?.kind === "day" ? 34 : 40)}
      aria-label="Deploys by day"
      className="h-80 w-full max-w-md rounded-large bg-surface-3"
    >
      {(row) =>
        row.kind === "day" ? (
          <p className="px-4 pt-3 pb-1.5 text-xs font-semibold text-muted">{row.label}</p>
        ) : (
          <div className="flex items-center gap-3 px-4 py-2 text-sm">
            <span className="min-w-0 flex-1 truncate font-medium">{row.repository}</span>
            <span className={row.environment === "production" ? "text-xs text-success-text" : "text-xs text-muted"}>
              {row.environment}
            </span>
            <span className="w-11 text-right text-muted tabular-nums">{row.time}</span>
          </div>
        )
      }
    </VirtualList>
  );
}
