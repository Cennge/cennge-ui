"use client";

import type { ReactNode } from "react";
import { LineChart } from "cennge-ui/charts";

// Median minutes per CI run, each day of October. payload-cache had no runs from the 13th to the 15th.
const cennge = [11.2, 10.8, 11.5, 10.9, 9.8, 9.6, 11.9, 12.4, 12.1, 11.6, 12.8, 10.2, 9.9, 12.5, 12.9, 13.4, 12.7, 13.1, 10.6, 10.4, 12.2, 11.8, 11.4, 11.9, 12.3, 10.1, 9.7, 11.3, 10.9, 10.6, 10.8];
const payload = [4.1, 4.3, 3.9, 4.6, 3.2, 3.1, 4.4, 4.2, 4.8, 4.5, 4.7, 3.4, null, null, null, 5.1, 4.9, 5.3, 3.8, 3.6, 4.6, 4.4, 4.9, 4.7, 4.2, 3.3, 3.5, 4.1, 3.9, 4.3, 4.0];
const runTime = cennge.map((minutes, day) => ({ day: `Oct ${day + 1}`, cennge: minutes, payload: payload[day] ?? null }));

const latency = [
  { hour: "00:00", p95: 212 },
  { hour: "04:00", p95: 198 },
  { hour: "08:00", p95: 246 },
  { hour: "12:00", p95: 301 },
  { hour: "16:00", p95: 287 },
  { hour: "20:00", p95: 233 },
];

function Panel({ title, detail, children }: { title: string; detail: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted">{detail}</p>
      </div>
      {children}
    </div>
  );
}

export default function LineChartPlate() {
  return (
    // Clips the charts' visually hidden data tables, which are as wide as their rows, to the plate. The dots
    // sit in a ring of the plate's surface.
    <div className="relative -m-2 flex w-[calc(100%+1rem)] flex-col gap-8 overflow-hidden p-2 [--cennge-chart-surface:var(--cennge-surface-2)]">
      <Panel title="CI run time" detail="Median minutes per run in October · sample data">
        <LineChart
          aria-label="Median CI run time per day in October"
          data={runTime}
          index="day"
          indexLabel="Day"
          series={[
            { key: "cennge", label: "cennge-ui" },
            { key: "payload", label: "payload-cache" },
          ]}
          valueFormat={(minutes) => `${minutes} min`}
          className="h-60"
        />
      </Panel>
      <Panel title="payload-cache response time" detail="95th percentile by hour · sample data">
        <LineChart
          aria-label="payload-cache response time, 95th percentile"
          data={latency}
          index="hour"
          indexLabel="Hour"
          series={[{ key: "p95", label: "p95" }]}
          startAtZero={false}
          showDots
          valueFormat={(ms) => `${ms} ms`}
          className="h-48"
        />
      </Panel>
    </div>
  );
}
