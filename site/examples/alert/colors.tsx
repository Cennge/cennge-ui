"use client";

import { Alert } from "cennge-ui";

export default function AlertColors() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      {/* role="status": read when the screen reader is free. */}
      <Alert title="Drafts are visible only to you" />
      <Alert color="info" title="ai-niche-scout moved to a new default branch" description="main replaces master." />
      <Alert color="success" title="All checks passed" description="Typecheck, unit tests and build on main." />
      {/* role="alert": interrupts the screen reader. */}
      <Alert color="warning" title="2 dependencies are a major version behind" />
      <Alert color="danger" title="Deploy failed" description="spredo-crypto-screener is still on the previous release." />
    </div>
  );
}
