"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "cennge-ui";
import { BarChart } from "cennge-ui/charts";

type Deploys = { day: string; deploys: number }[];

const lastWeek: Deploys = [
  { day: "Mon", deploys: 3 },
  { day: "Tue", deploys: 1 },
  { day: "Wed", deploys: 4 },
  { day: "Thu", deploys: 2 },
  { day: "Fri", deploys: 5 },
];
const thisWeek: Deploys = [];

export default function DeploysPerDay() {
  const [week, setWeek] = useState("this");
  return (
    <div className="flex w-full flex-col gap-4">
      <ToggleGroup aria-label="Week" size="sm" value={week} onValueChange={(value) => value && setWeek(value)}>
        <ToggleGroupItem value="last">Last week</ToggleGroupItem>
        <ToggleGroupItem value="this">This week</ToggleGroupItem>
      </ToggleGroup>
      <BarChart
        aria-label="Deploys of payload-cache per day"
        data={week === "last" ? lastWeek : thisWeek}
        index="day"
        indexLabel="Day"
        series={[{ key: "deploys", label: "Deploys" }]}
        emptyContent="No deploys yet this week"
        className="h-48"
      />
    </div>
  );
}
