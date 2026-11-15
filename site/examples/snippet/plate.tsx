"use client";

import { Snippet } from "cennge-ui";

const steps = [
  { title: "Install", command: "pnpm add cennge-ui" },
  { title: "Work on the library", command: "git clone https://github.com/Cennge/cennge-ui\ncd cennge-ui\npnpm install\npnpm dev" },
  { title: "End-to-end tests on desktop", command: "pnpm exec playwright test --project=chromium --project=firefox --project=webkit" },
];

export default function SnippetPlate() {
  return (
    <ol className="flex w-full min-w-0 flex-col gap-5">
      {steps.map((step) => (
        <li key={step.title} className="flex min-w-0 flex-col gap-2">
          <span className="text-sm font-medium text-muted">{step.title}</span>
          <Snippet className="w-full">{step.command}</Snippet>
        </li>
      ))}
    </ol>
  );
}
