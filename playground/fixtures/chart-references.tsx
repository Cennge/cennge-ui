import { BarChart, LineChart, movingAverage } from "cennge-ui/charts";

const commits = [
  { day: "Mon", commits: 7 },
  { day: "Tue", commits: 4 },
  { day: "Wed", commits: 9 },
  { day: "Thu", commits: 5 },
  { day: "Fri", commits: 6 },
  { day: "Sat", commits: 1 },
  { day: "Sun", commits: 2 },
];

const builds = [52, 49, 61, 47, 55, 58, 44, 51, 63, 48, 46, 50, 45, 42];
const trend = movingAverage(builds, 7);
const buildData = builds.map((seconds, i) => ({ day: `Nov ${i + 1}`, seconds, trend: trend[i] === null ? null : Math.round(trend[i]! * 10) / 10 }));

export default function ChartReferencesFixture() {
  return (
    <div className="flex flex-col gap-8">
      <BarChart
        aria-label="Commits a day to cennge-ui"
        data={commits}
        index="day"
        series={[{ key: "commits", label: "Commits" }]}
        references={[{ value: 6, label: "Goal 6" }]}
      />
      <LineChart
        aria-label="Build time of cennge-ui, seconds"
        data={buildData}
        index="day"
        series={[
          { key: "seconds", label: "Build", display: "dots" },
          { key: "trend", label: "7-day average" },
        ]}
        startAtZero={false}
        references={[{ from: 30, to: 45, label: "Target", color: "success" }]}
      />
      <BarChart
        aria-label="Bundle size by component, KB gzip"
        layout="horizontal"
        data={[
          { name: "Button", kb: 2.1 },
          { name: "Select", kb: 6.4 },
          { name: "Table", kb: 4.8 },
        ]}
        index="name"
        series={[{ key: "kb", label: "KB gzip" }]}
        references={[{ value: 5, label: "Budget" }]}
        className="h-48"
      />
    </div>
  );
}
