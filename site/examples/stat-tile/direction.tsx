"use client";

import { StatTile } from "cennge-ui";

export default function Directions() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
      <StatTile label="Stars" value={412} delta={18} deltaLabel="this month" />
      <StatTile label="Median build" value={48} unit="s" delta={-6} goodDirection="down" deltaLabel="this month" />
      <StatTile label="Deploys" value={27} delta={-3} goodDirection="none" deltaLabel="this month" />
    </div>
  );
}
