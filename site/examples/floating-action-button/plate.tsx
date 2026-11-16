"use client";

import { useState } from "react";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger, FloatingActionButton } from "cennge-ui";

const plus = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export default function QuickLog() {
  const [logged, setLogged] = useState<string[]>([]);

  return (
    <div className="relative flex h-[30rem] w-full max-w-[22rem] flex-col overflow-hidden rounded-[1.75rem] border border-border bg-surface-1">
      <div className="flex-1 overflow-y-auto p-5">
        <h3 className="text-xl font-semibold">Today</h3>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {logged.length ? logged.map((entry, i) => <li key={i}>{entry}</li>) : <li className="text-muted">Nothing logged yet.</li>}
        </ul>
      </div>
      <Dropdown>
        <DropdownTrigger>
          <FloatingActionButton icon={plus} label="Log" position="static" className="absolute right-4 bottom-4" />
        </DropdownTrigger>
        <DropdownContent placement="top" align="end">
          {["Deploy of ai-niche-scout", "Release of cennge-ui", "Review of payload-cache"].map((entry) => (
            <DropdownItem key={entry} onAction={() => setLogged((all) => [...all, entry])}>
              {entry}
            </DropdownItem>
          ))}
        </DropdownContent>
      </Dropdown>
    </div>
  );
}
