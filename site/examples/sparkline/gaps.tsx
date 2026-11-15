"use client";

import { Sparkline } from "cennge-ui/charts";

// Monitoring was down on the 4th and 5th day, and again on the 7th: null, not 0.
const errors = [3, 5, 4, null, null, 6, null, 2, 3, 1];

export default function ErrorsWithGaps() {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted">Scraper errors a day</span>
      <Sparkline
        aria-label="Scraper errors a day over 10 days, with three days missing"
        data={errors}
        className="h-10 w-40"
      />
    </div>
  );
}
