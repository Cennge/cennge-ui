"use client";

import { CircularProgress, Progress } from "cennge-ui";

export default function StillWorking() {
  return (
    <div className="flex w-full flex-wrap items-center gap-x-10 gap-y-6">
      <Progress label="Cloning playwright-msi-scraper" className="max-w-sm" />
      <CircularProgress label="Installing dependencies" />
    </div>
  );
}
