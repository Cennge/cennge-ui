"use client";

import { Badge, type CenngeColor } from "cennge-ui";

const pulls: {
  title: string;
  branch: string;
  labels: { name: string; color: CenngeColor }[];
  checks: { text: string; color: CenngeColor };
}[] = [
  {
    title: "Kbd draws its key symbols at the size of the cap",
    branch: "fix/kbd-symbols-at-cap-size",
    labels: [{ name: "bug", color: "danger" }, { name: "kbd", color: "default" }],
    checks: { text: "Passing", color: "success" },
  },
  {
    title: "Charts in a new entry, cennge-ui/charts",
    branch: "feat/charts",
    labels: [{ name: "feature", color: "success" }, { name: "charts", color: "default" }],
    checks: { text: "Running", color: "warning" },
  },
  {
    title: "Carousel dots show the pointer cursor",
    branch: "fix/carousel-dot-cursor",
    labels: [{ name: "bug", color: "danger" }, { name: "carousel", color: "default" }],
    checks: { text: "Failing", color: "danger" },
  },
];

function BranchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <circle cx="6" cy="5.5" r="2" />
      <circle cx="6" cy="18.5" r="2" />
      <circle cx="18" cy="8" r="2" />
      <path d="M6 7.5v9M18 10c0 4-6 3.5-11 7" strokeLinecap="round" />
    </svg>
  );
}

export default function BadgePlate() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-1">
      <div className="flex items-center gap-2 pb-2">
        <span className="font-semibold">Pull requests</span>
        <Badge size="sm" variant="solid" color="primary">
          3
        </Badge>
      </div>
      <ul className="flex flex-col">
        {pulls.map((pull) => (
          <li key={pull.branch} className="flex items-start justify-between gap-4 border-t border-border py-3.5">
            <div className="flex min-w-0 flex-col gap-2">
              <span className="font-medium">{pull.title}</span>
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <Badge variant="faded" size="sm" radius="sm" startContent={<BranchIcon />} className="max-w-44 font-mono font-medium">
                  {pull.branch}
                </Badge>
                {pull.labels.map((label) => (
                  <Badge key={label.name} size="sm" color={label.color}>
                    {label.name}
                  </Badge>
                ))}
              </div>
            </div>
            <Badge variant="dot" color={pull.checks.color} className="shrink-0">
              {pull.checks.text}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
