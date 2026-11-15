"use client";

import { RangeMeter, StatTile } from "cennge-ui";
import { Sparkline } from "cennge-ui/charts";

const runs = [212, 198, 240, 251, 236, 270, 288, 276, 301, 322, 315, 348];

export default function StatTilePlate() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
      <StatTile label="Commits this week" value={34} delta={6} deltaLabel="vs last week" />
      <StatTile label="Button, gzip" value={2.1} unit="KB" delta={-0.3} goodDirection="down" deltaLabel="since 0.3.0" />
      <StatTile
        label="CI runs a week"
        value={348}
        delta={33}
        deltaLabel="vs last week"
        chart={<Sparkline aria-label="CI runs a week over 12 weeks, up from 212 to 348" data={runs} variant="area" curve="smooth" className="h-10 w-full" />}
      />
      <StatTile
        label="Open issues"
        value={23}
        delta={4}
        goodDirection="down"
        deltaLabel="this week"
        chart={<RangeMeter label="Triage limit" value={23} high={30} size="sm" showStatus={false} />}
      />
    </div>
  );
}
