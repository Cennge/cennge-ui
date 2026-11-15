"use client";

import type { ReactNode } from "react";
import { AreaChart } from "cennge-ui/charts";

const minutes = [
  { month: "Mar", cennge: 820, scraper: 310, cache: 240, scout: 180, screener: 150 },
  { month: "Apr", cennge: 910, scraper: 290, cache: 260, scout: 210, screener: 140 },
  { month: "May", cennge: 1040, scraper: 340, cache: 230, scout: 260, screener: 170 },
  { month: "Jun", cennge: 1180, scraper: 360, cache: 280, scout: 240, screener: 190 },
  { month: "Jul", cennge: 1320, scraper: 330, cache: 310, scout: 220, screener: 160 },
  { month: "Aug", cennge: 1250, scraper: 380, cache: 290, scout: 270, screener: 180 },
  { month: "Sep", cennge: 1460, scraper: 410, cache: 330, scout: 300, screener: 200 },
  { month: "Oct", cennge: 1610, scraper: 390, cache: 350, scout: 280, screener: 210 },
];

const perTwoHours = [2180, 1650, 1920, 5100, 8600, 9300, 9050, 9350, 8200, 6100, 4400, 3100];
const requests = perTwoHours.map((count, i) => ({ hour: `${String(i * 2).padStart(2, "0")}:00`, count }));

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

export default function AreaChartPlate() {
  return (
    // Clips the charts' visually hidden data tables, which are as wide as their rows, to the plate. The dots
    // sit in a ring of the plate's surface.
    <div className="relative -m-2 flex w-[calc(100%+1rem)] flex-col gap-8 overflow-hidden p-2 [--cennge-chart-surface:var(--cennge-surface-2)]">
      <Panel title="CI minutes by repository" detail="Per month, stacked · sample data">
        <AreaChart
          aria-label="CI minutes per month by repository"
          data={minutes}
          index="month"
          indexLabel="Month"
          isStacked
          series={[
            { key: "cennge", label: "cennge-ui" },
            { key: "scraper", label: "playwright-msi-scraper" },
            { key: "cache", label: "payload-cache" },
            { key: "scout", label: "ai-niche-scout" },
            { key: "screener", label: "spredo-crypto-screener" },
          ]}
          className="h-72"
        />
      </Panel>
      <Panel title="Requests to payload-cache" detail="Every two hours, yesterday · sample data">
        <AreaChart
          aria-label="Requests to payload-cache every two hours"
          data={requests}
          index="hour"
          indexLabel="From"
          curve="smooth"
          series={[{ key: "count", label: "Requests" }]}
          className="h-44"
        />
      </Panel>
    </div>
  );
}
