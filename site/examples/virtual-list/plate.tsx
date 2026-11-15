"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button, NumberInput, VirtualList, type Virtualizer } from "cennge-ui";

const repositories = ["cennge-ui", "ai-niche-scout", "payload-cache", "spredo-crypto-screener", "playwright-msi-scraper"];
const failures = ["Typecheck exited with code 2", "Playwright · webkit: 1 test failed", "Build cancelled after 10 minutes"];

interface Run {
  number: number;
  repository: string;
  seconds: number;
  failure?: string;
}

// 10,000 runs, newest first; every seventh failed and carries a second line.
const runs: Run[] = Array.from({ length: 10_000 }, (_, index) => ({
  number: 10_000 - index,
  repository: repositories[index % repositories.length]!,
  seconds: 40 + ((index * 37) % 420),
  failure: index % 7 === 3 ? failures[index % failures.length] : undefined,
}));

const count = new Intl.NumberFormat("en-US");
const duration = (seconds: number) => (seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`);

export default function VirtualListPlate() {
  const list = useRef<Pick<Virtualizer, "scrollToIndex">>(null);
  const [target, setTarget] = useState<number | null>(4812);
  const [shown, setShown] = useState<number | null>(null);

  const jump = (event: FormEvent) => {
    event.preventDefault();
    if (target === null) return;
    const index = 10_000 - target;
    list.current?.scrollToIndex(index, { align: "center" });
    setShown(target);
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <form onSubmit={jump} className="flex items-end gap-2">
        <NumberInput label="Run" size="sm" min={1} max={10_000} value={target} onValueChange={setTarget} className="w-36" />
        <Button type="submit" size="sm" variant="flat" color="primary">
          Go to run
        </Button>
      </form>
      <VirtualList
        items={runs}
        getKey={(run) => run.number}
        estimateSize={52}
        listRef={list}
        aria-label={`${count.format(runs.length)} workflow runs`}
        fadeEdges
        className="h-80 w-full rounded-large border border-border bg-surface-1"
      >
        {(run) => (
          <div
            data-current={run.number === shown || undefined}
            className="flex items-start gap-3 border-b border-border px-4 py-2.5 text-sm data-[current]:bg-primary-bg"
          >
            <span
              role="img"
              aria-label={run.failure ? "Failed" : "Passed"}
              className={`mt-1.5 size-2 shrink-0 rounded-full ${run.failure ? "bg-danger" : "bg-success"}`}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate">
                <span className="font-medium">{run.repository}</span>{" "}
                <span className="text-muted tabular-nums">#{count.format(run.number)}</span>
              </p>
              {run.failure ? <p className="text-xs text-danger-text">{run.failure}</p> : null}
            </div>
            <span className="text-muted tabular-nums">{duration(run.seconds)}</span>
          </div>
        )}
      </VirtualList>
    </div>
  );
}
