import { AreaChart, LineChart } from "cennge-ui/charts";

const days = Array.from({ length: 30 }, (_, i) => `Oct ${i + 1}`);
// Requests a day to two services: steady growth, a dip on the weekends, and an outage with no data.
const requests = days.map((day, i) => ({
  day,
  api: 4000 + i * 120 + (i % 7 >= 5 ? -900 : 0),
  web: i >= 12 && i <= 14 ? null : 2600 + i * 60 + (i % 7 >= 5 ? -400 : 0),
}));

const builds = [
  { week: "W1", passed: 42, failed: 6, flaky: 3 },
  { week: "W2", passed: 51, failed: 4, flaky: 5 },
  { week: "W3", passed: 47, failed: 9, flaky: 2 },
  { week: "W4", passed: 58, failed: 3, flaky: 4 },
  { week: "W5", passed: 63, failed: 5, flaky: 1 },
  { week: "W6", passed: 66, failed: 2, flaky: 2 },
];

const latency = [
  { hour: "00:00", p95: 212 },
  { hour: "04:00", p95: 198 },
  { hour: "08:00", p95: 246 },
  { hour: "12:00", p95: 301 },
  { hour: "16:00", p95: 287 },
  { hour: "20:00", p95: 233 },
];

export default function LineChartFixture() {
  return (
    <div className="flex flex-col gap-8">
      <LineChart
        aria-label="Requests a day"
        data={requests}
        index="day"
        indexLabel="Day"
        series={[
          { key: "api", label: "api.cennge.dev" },
          { key: "web", label: "cennge.dev" },
        ]}
      />
      <AreaChart
        aria-label="CI runs a week"
        data={builds}
        index="week"
        indexLabel="Week"
        isStacked
        curve="smooth"
        series={[
          { key: "passed", label: "Passed", color: "success" },
          { key: "flaky", label: "Flaky", color: "warning" },
          { key: "failed", label: "Failed", color: "danger" },
        ]}
        className="h-64"
      />
      <LineChart
        aria-label="Latency, 95th percentile"
        data={latency}
        index="hour"
        series={[{ key: "p95", label: "p95" }]}
        startAtZero={false}
        showDots
        valueFormat={(ms) => `${ms} ms`}
        className="h-56"
      />
    </div>
  );
}
