"use client";

import { useEffect, useState } from "react";
import { Button, Tooltip } from "cennge-ui";

function CopyIcon({ done }: { done: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {done ? (
        <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <>
          <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
          <path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

/** Copies `text`; says so for a moment, also to screen readers. */
export function CopyButton({ text, label = "Copy code", className }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => setDone(false), 1600);
    return () => clearTimeout(timer);
  }, [done]);

  return (
    <Tooltip content={done ? "Copied" : label}>
      <Button
        isIconOnly
        size="sm"
        variant="light"
        aria-label={done ? "Copied" : label}
        className={className}
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          setDone(true);
        }}
      >
        <CopyIcon done={done} />
      </Button>
    </Tooltip>
  );
}
