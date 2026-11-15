import { StatTile } from "cennge-ui";
import { Sparkline } from "cennge-ui/charts";

export default function StatTileFixture() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <StatTile label="Commits this week" value={34} delta={6} deltaLabel="vs last week" />
      <StatTile label="Button, gzip" value={2.1} unit="KB" delta={-0.3} goodDirection="down" deltaLabel="since 0.3.0" />
      <StatTile label="Open issues" value={23} delta={4} goodDirection="down" deltaLabel="this week" />
      <StatTile label="Stars" value={412} delta={0} deltaLabel="today" />
      <StatTile
        label="CI runs, last 12 weeks"
        value={3157}
        delta={12}
        formatDelta={(delta) => `+${delta}%`}
        chart={<Sparkline aria-label="CI runs per week, up from 212 to 348" data={[212, 198, 240, 251, 236, 270, 288, 276, 301, 322, 315, 348]} variant="area" className="h-10 w-full" />}
      />
    </div>
  );
}
