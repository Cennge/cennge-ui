"use client";

import { FloatingActionButton } from "cennge-ui";

const play = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5.5v13l10.5-6.5z" />
  </svg>
);

export default function StartRun() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <FloatingActionButton icon={play} label="Start a run" position="static" />
      <FloatingActionButton icon={play} label="Start a run" isExtended position="static" />
      <FloatingActionButton icon={play} label="Start a run" size="lg" color="success" position="static" />
    </div>
  );
}
