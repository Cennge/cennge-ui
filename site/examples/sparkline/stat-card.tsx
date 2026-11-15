"use client";

import { Card, CardBody } from "cennge-ui";
import { Sparkline } from "cennge-ui/charts";

const runs = [212, 198, 240, 251, 236, 270, 288, 276, 301, 322, 315, 348];
const total = runs.reduce((sum, week) => sum + week, 0);

export default function CiRunsCard() {
  return (
    <Card variant="flat" className="w-full max-w-64">
      <CardBody>
        <p className="text-sm text-muted">CI runs, last 12 weeks</p>
        <p className="text-2xl font-semibold tabular-nums">{total.toLocaleString("en-US")}</p>
        <Sparkline
          aria-label="CI runs per week over 12 weeks, up from 212 to 348"
          data={runs}
          variant="area"
          curve="smooth"
          className="mt-2 h-12 w-full"
        />
      </CardBody>
    </Card>
  );
}
