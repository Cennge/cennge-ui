"use client";

import { useRef, useState } from "react";
import { Button, VirtualList, type Virtualizer } from "cennge-ui";

interface Page {
  number: number;
  error?: string;
}

// A run of playwright-msi-scraper over 6,000 pages; a few of them timed out.
const pages: Page[] = Array.from({ length: 6_000 }, (_, index) => ({
  number: index + 1,
  error: index % 1_237 === 611 ? "Timeout 30000ms exceeded" : undefined,
}));

const failures = pages.flatMap((page, index) => (page.error ? [index] : []));

export default function NextFailure() {
  const list = useRef<Pick<Virtualizer, "scrollToIndex">>(null);
  const [current, setCurrent] = useState(-1);

  const go = (step: 1 | -1) => {
    const next = current < 0 && step < 0 ? failures.length - 1 : (current + step + failures.length) % failures.length;
    setCurrent(next);
    // "auto" scrolls only as far as it takes to bring the row into view.
    list.current?.scrollToIndex(failures[next]!, { align: "auto" });
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="flat" onClick={() => go(-1)}>
          Previous failure
        </Button>
        <Button size="sm" variant="flat" color="danger" onClick={() => go(1)}>
          Next failure
        </Button>
        <span className="text-sm text-muted" aria-live="polite">
          {current < 0 ? `${failures.length} of 6,000 pages failed` : `Failure ${current + 1} of ${failures.length}`}
        </span>
      </div>
      <VirtualList
        items={pages}
        getKey={(page) => page.number}
        estimateSize={30}
        listRef={list}
        aria-label="Scraped pages"
        className="h-64 w-full rounded-large bg-surface-3"
      >
        {(page, index) => (
          <div
            className={`flex gap-4 px-4 py-1.5 font-mono text-xs ${index === failures[current] ? "bg-danger-bg" : ""}`}
          >
            <span className="w-20 shrink-0 tabular-nums">page {page.number}</span>
            {page.error ? <span className="text-danger-text">{page.error}</span> : <span className="text-muted">saved</span>}
          </div>
        )}
      </VirtualList>
    </div>
  );
}
