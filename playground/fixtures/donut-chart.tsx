import { DonutChart } from "cennge-ui/charts";

const languages = [
  { language: "TypeScript", bytes: 412_000 },
  { language: "Python", bytes: 139_000 },
  { language: "Rust", bytes: 61_000 },
  { language: "Shell", bytes: 33_000 },
  { language: "Other", bytes: 19_000 },
];

const traffic = [
  { source: "GitHub", visits: 5200 },
  { source: "npm", visits: 3100 },
  { source: "Search", visits: 1900 },
  { source: "Direct", visits: 800 },
];

const labels = [
  { label: "bug", count: 9 },
  { label: "question", count: 0 },
  { label: "enhancement", count: 14 },
];

export default function DonutChartFixture() {
  return (
    <div className="flex flex-col gap-8">
      <DonutChart
        aria-label="Languages in spredo-crypto-screener"
        data={languages}
        index="language"
        value="bytes"
        indexLabel="Language"
        valueLabel="Bytes"
        colors={[undefined, undefined, undefined, undefined, "default"]}
      />
      <DonutChart aria-label="Visits by source" data={traffic} index="source" value="visits" variant="pie" />
      <DonutChart aria-label="Open issues by label" data={labels} index="label" value="count" />
      <DonutChart aria-label="Downloads by country" data={[] as { country: string; count: number }[]} index="country" value="count" />
    </div>
  );
}
