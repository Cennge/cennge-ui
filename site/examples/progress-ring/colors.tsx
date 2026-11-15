"use client";

import { ProgressRing } from "cennge-ui";

export default function RingColors() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <ProgressRing aria-label="Deploys that passed" value={18} max={20} size="md" color="success" />
      <ProgressRing aria-label="Disk used on the runner" value={71} size="md" color="warning" />
      <ProgressRing aria-label="Builds on the slow runner" value={4} max={10} size="md" color="chart-4" />
      <ProgressRing aria-label="Downloads goal" value={640} max={1000} size="md" color="info" />
    </div>
  );
}
