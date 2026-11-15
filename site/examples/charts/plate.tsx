"use client";

import type { ReactNode } from "react";
import { BarChart, Sparkline } from "cennge-ui/charts";

// CI minutes per month, March to October.
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

const totals = minutes.map((month) => month.cennge + month.scraper + month.cache + month.scout + month.screener);
const cennge = minutes.map((month) => month.cennge);
const number = new Intl.NumberFormat("en-US");
const first = { all: totals[0]!, cennge: cennge[0]! };
const last = { all: totals.at(-1)!, cennge: cennge.at(-1)! };

function Tile({ label, value, detail, children }: { label: string; value: string; detail: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 basis-40 flex-col gap-1 rounded-large bg-surface-3 p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{detail}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function ChartsPlate() {
  return (
    // Clips the chart's visually hidden data table, which is as wide as its rows, to the plate.
    <div className="relative -m-2 flex w-[calc(100%+1rem)] flex-col gap-6 overflow-hidden p-2">
      <div className="flex flex-wrap gap-3">
        <Tile label="CI minutes in October" value={number.format(last.all)} detail={`up from ${number.format(first.all)} in March`}>
          <Sparkline
            aria-label={`CI minutes per month since March, up from ${number.format(first.all)} to ${number.format(last.all)}`}
            data={totals}
            variant="area"
            className="h-10 w-full"
          />
        </Tile>
        <Tile
          label="cennge-ui in October"
          value={number.format(last.cennge)}
          detail={`${Math.round((last.cennge / last.all) * 100)}% of all the minutes`}
        >
          <Sparkline
            aria-label={`CI minutes of cennge-ui per month since March, up from ${number.format(first.cennge)} to ${number.format(last.cennge)}`}
            data={cennge}
            color="chart-1"
            className="h-10 w-full"
          />
        </Tile>
      </div>
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-semibold">CI minutes by repository</p>
          <p className="text-xs text-muted">Per month, stacked · sample data</p>
        </div>
        <BarChart
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
      </div>
    </div>
  );
}
