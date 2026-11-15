"use client";

import { LineChart } from "cennge-ui/charts";

// The scraper did not run over the weekend: null, not 0.
const days = [
  { day: "Oct 27", pages: 1840 },
  { day: "Oct 28", pages: 1920 },
  { day: "Oct 29", pages: 2310 },
  { day: "Oct 30", pages: 2240 },
  { day: "Oct 31", pages: null },
  { day: "Nov 1", pages: null },
  { day: "Nov 2", pages: 2405 },
  { day: "Nov 3", pages: 2120 },
  { day: "Nov 4", pages: 2260 },
  { day: "Nov 5", pages: 2380 },
];

export default function PagesScraped() {
  return (
    <LineChart
      aria-label="Pages scraped per day"
      data={days}
      index="day"
      indexLabel="Day"
      series={[{ key: "pages", label: "Pages" }]}
      className="h-56"
    />
  );
}
