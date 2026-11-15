"use client";

import { ProgressRing } from "cennge-ui";

export default function IssuesClosed() {
  return (
    <ProgressRing aria-label="Issues closed in the 0.4 milestone" value={12} max={15}>
      <span className="text-2xl font-semibold">12</span>
      <span className="text-xs text-muted">of 15 issues</span>
    </ProgressRing>
  );
}
