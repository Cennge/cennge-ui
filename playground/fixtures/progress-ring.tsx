import { ProgressRing } from "cennge-ui";

export default function ProgressRingFixture() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <ProgressRing aria-label="Commits this week" value={34} max={40}>
        <span className="text-2xl font-semibold">34</span>
        <span className="text-xs text-muted">of 40</span>
      </ProgressRing>
      <ProgressRing
        aria-label="Goals this week"
        size="xl"
        rings={[
          { label: "Commits", value: 34, max: 40 },
          { label: "Reviews", value: 9, max: 6 },
          { label: "Deploys", value: 2, max: 5 },
        ]}
      />
      <ProgressRing aria-label="Releases this month" value={0} max={4} size="md" />
      <ProgressRing aria-label="Issues closed" value={12} max={12} size="sm" color="success" />
      <ProgressRing
        aria-label="CI minutes"
        value={1820}
        max={2000}
        formatValue={(value, max) => `${max - value} minutes left`}
        size={96}
        strokeWidth={6}
      />
    </div>
  );
}
