"use client";

import { Sparkline } from "cennge-ui/charts";

// Millions of requests a week, the oldest first.
const requests = [0.9, 0.95, 0.93, 1.02, 1.08, 1.05, 1.14, 1.2];

export default function InlineTrend() {
  return (
    <p className="max-w-md text-sm leading-relaxed">
      payload-cache answered 1.2 million requests last week{" "}
      <Sparkline
        aria-label="Requests per week over 8 weeks, up by a third"
        data={requests}
        className="mx-0.5 h-4 w-14"
      />{" "}
      and 1.1 million the week before.
    </p>
  );
}
