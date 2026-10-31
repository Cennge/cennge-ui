import { BarChart } from "cennge-ui/charts";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const downloads = months.map((month, i) => ({
  month,
  cennge: [320, 410, 380, 520, 610, 580, 720, 840, 790, 960, 1120, 1280][i]!,
  payload: [210, 230, 260, 240, 300, 340, 310, 360, 420, 410, 450, 520][i]!,
}));

const issues = [
  { repo: "spredo-crypto-screener", open: 14, closed: 52 },
  { repo: "playwright-msi-scraper", open: 9, closed: 31 },
  { repo: "ai-niche-scout", open: 21, closed: 18 },
  { repo: "payload-cache", open: 4, closed: 27 },
  { repo: "cennge-ui", open: 6, closed: 44 },
];

const stars = [
  { week: "W1", change: 12 },
  { week: "W2", change: -3 },
  { week: "W3", change: 8 },
  { week: "W4", change: 25 },
  { week: "W5", change: -7 },
  { week: "W6", change: 15 },
];

export default function BarChartFixture() {
  return (
    <div className="flex flex-col gap-8">
      <BarChart
        aria-label="Monthly npm downloads"
        data={downloads}
        index="month"
        indexLabel="Month"
        series={[
          { key: "cennge", label: "cennge-ui" },
          { key: "payload", label: "payload-cache" },
        ]}
      />
      <BarChart
        aria-label="Issues by repository"
        data={issues}
        index="repo"
        indexLabel="Repository"
        layout="horizontal"
        isStacked
        series={[
          { key: "closed", label: "Closed" },
          { key: "open", label: "Open" },
        ]}
        className="h-64"
      />
      <BarChart aria-label="Stars gained per week" data={stars} index="week" series={[{ key: "change", label: "Stars" }]} className="h-56" />
      <BarChart aria-label="Releases" data={[] as { day: string; count: number }[]} index="day" series={[{ key: "count" }]} className="h-40" />
    </div>
  );
}
