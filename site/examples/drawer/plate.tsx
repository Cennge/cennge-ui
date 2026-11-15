"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Combobox,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Radio,
  RadioGroup,
} from "cennge-ui";

type State = "open" | "closed" | "all";

const issues = [
  { number: 52, title: "Cached results outlive a model update", state: "open", labels: ["bug"] },
  { number: 51, title: "Document the CLI client", state: "open", labels: ["documentation", "cli"] },
  { number: 49, title: "Warm the cache after a deploy", state: "open", labels: ["enhancement"] },
  { number: 47, title: "Report the hit rate", state: "open", labels: ["enhancement", "good first issue"] },
  { number: 44, title: "Keys collide for long inputs", state: "closed", labels: ["bug"] },
  { number: 40, title: "The CLI ignores the TTL option", state: "closed", labels: ["bug", "cli"] },
];

const labels = [
  "bug",
  "documentation",
  "enhancement",
  "good first issue",
  "help wanted",
  "question",
  "performance",
  "breaking change",
  "dependencies",
  "security",
  "api",
  "cli",
  "python",
  "tests",
  "ci",
].map((label) => ({ value: label, label }));

function IssueIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={`mt-0.5 size-4 shrink-0 ${isOpen ? "text-success-text" : "text-muted"}`} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" />
      {isOpen ? <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" /> : <path d="m5.5 8 1.75 1.75L10.5 6.5" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

export default function DrawerPlate() {
  const [state, setState] = useState<State>("open");
  const [chosen, setChosen] = useState<string[]>([]);

  const shown = issues.filter(
    (issue) => (state === "all" || issue.state === state) && (chosen.length === 0 || chosen.some((label) => issue.labels.includes(label))),
  );
  const filterCount = (state === "open" ? 0 : 1) + chosen.length;

  return (
    <div className="w-full max-w-lg rounded-large bg-surface-3">
      <div className="flex items-center justify-between gap-3 border-b border-border py-2.5 pr-2.5 pl-5">
        <p className="font-medium">
          payload-cache <span className="whitespace-nowrap text-muted">· {shown.length} issues</span>
        </p>
        <Drawer>
          <DrawerTrigger>
            <Button
              variant="flat"
              size="sm"
              endContent={
                filterCount ? (
                  <Badge size="sm" color="primary">
                    <span className="sr-only">, </span>
                    {filterCount}
                    <span className="sr-only"> set</span>
                  </Badge>
                ) : null
              }
            >
              Filters
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filters</DrawerTitle>
              <DrawerDescription>Issues in Cennge/payload-cache</DrawerDescription>
            </DrawerHeader>
            <DrawerBody className="flex flex-col gap-6">
              <RadioGroup label="State" value={state} onValueChange={(value) => setState(value as State)}>
                <Radio value="open">Open</Radio>
                <Radio value="closed">Closed</Radio>
                <Radio value="all">All</Radio>
              </RadioGroup>
              <Combobox selectionMode="multiple" label="Labels" placeholder="Any label" items={labels} values={chosen} onValuesChange={setChosen} />
            </DrawerBody>
            <DrawerFooter>
              <Button
                variant="flat"
                onClick={() => {
                  setState("open");
                  setChosen([]);
                }}
              >
                Reset
              </Button>
              <DrawerClose>
                <Button color="primary">Show {shown.length} issues</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
      <ul className="divide-y divide-border">
        {shown.map((issue) => (
          <li key={issue.number} className="flex gap-3 px-5 py-3">
            <IssueIcon isOpen={issue.state === "open"} />
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
              <span className="text-sm font-medium">{issue.title}</span>
              <span className="text-sm text-muted">#{issue.number}</span>
              {issue.labels.map((label) => (
                <Badge key={label} size="sm" variant="flat">
                  {label}
                </Badge>
              ))}
            </div>
          </li>
        ))}
        {shown.length === 0 ? <li className="px-5 py-6 text-sm text-muted">No issues match these filters.</li> : null}
      </ul>
    </div>
  );
}
