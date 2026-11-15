"use client";

import { ProgressRing } from "cennge-ui";

const repositories = [
  { name: "cennge-ui", passed: 418, tests: 420 },
  { name: "payload-cache", passed: 96, tests: 112 },
  { name: "spredo-crypto-screener", passed: 61, tests: 88 },
];

export default function TestRows() {
  return (
    <ul className="flex w-full max-w-sm flex-col gap-3">
      {repositories.map((repository) => (
        <li key={repository.name} className="flex items-center gap-3">
          <ProgressRing aria-label={`${repository.name}, tests passing`} value={repository.passed} max={repository.tests} size={28} strokeWidth={4} />
          <span className="min-w-0 flex-1 truncate text-sm">{repository.name}</span>
          <span className="text-sm text-muted tabular-nums">
            {repository.passed} / {repository.tests}
          </span>
        </li>
      ))}
    </ul>
  );
}
