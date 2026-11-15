"use client";

import { Card, CardBody } from "cennge-ui";
import { AreaChart } from "cennge-ui/charts";

// Requests in each two hours, from midnight.
const perTwoHours = [
  2180, 1650, 1920, 5100, 8600, 9300,
  9050, 9350, 8200, 6100, 4400, 3100,
];
const requests = perTwoHours.map((count, i) => ({ hour: `${String(i * 2).padStart(2, "0")}:00`, count }));
const total = perTwoHours.reduce((sum, count) => sum + count, 0);

export default function RequestsCard() {
  return (
    <Card variant="flat" className="w-full max-w-sm">
      <CardBody>
        <p className="text-sm text-muted">Requests to payload-cache yesterday</p>
        <p className="text-2xl font-semibold tabular-nums">{total.toLocaleString("en-US")}</p>
        <AreaChart
          aria-label="Requests to payload-cache every two hours"
          data={requests}
          index="hour"
          indexLabel="From"
          curve="smooth"
          series={[{ key: "count", label: "Requests" }]}
          showXAxis={false}
          showYAxis={false}
          showGrid={false}
          className="mt-2 h-24"
        />
      </CardBody>
    </Card>
  );
}
