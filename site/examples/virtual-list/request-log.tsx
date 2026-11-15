"use client";

import { useState } from "react";
import { useVirtualizer } from "cennge-ui";

const paths = ["/api/posts", "/api/posts?page=2", "/api/media/cover.webp", "/api/users/me", "/api/globals/footer"];

// 20,000 lines of payload-cache's request log.
const lines = Array.from({ length: 20_000 }, (_, index) => {
  const seconds = index * 0.37;
  const time = new Date(Date.UTC(2026, 10, 8, 9) + seconds * 1000).toISOString().slice(11, 23);
  const hit = index % 5 !== 0;
  return `${time}  ${hit ? "HIT " : "MISS"}  ${paths[index % paths.length]}  ${hit ? 2 + (index % 4) : 40 + (index % 90)} ms`;
});

export default function RequestLog() {
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({ count: lines.length, estimateSize: 20, scrollElement, paddingStart: 8, paddingEnd: 8 });

  return (
    <div
      ref={setScrollElement}
      tabIndex={0}
      role="region"
      aria-label="Request log"
      className="h-72 w-full overflow-auto rounded-large bg-surface-1 font-mono text-xs leading-5 outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring"
    >
      <div style={{ position: "relative", height: virtualizer.totalSize }}>
        {virtualizer.items.map(({ index, start }) => (
          <div
            key={index}
            ref={virtualizer.measureElement}
            data-index={index}
            className="flex gap-4 px-4"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${start}px)` }}
          >
            <span className="w-10 shrink-0 text-right text-muted select-none">{index + 1}</span>
            <span className="min-w-0 break-words whitespace-pre-wrap">{lines[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
