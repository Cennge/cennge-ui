"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "cennge-ui";

const repositories = ["cennge-ui", "ai-niche-scout", "payload-cache", "spredo-crypto-screener"];

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" strokeLinejoin="round" />
    </svg>
  );
}

export default function RepositoryLayout() {
  const [layout, setLayout] = useState<string | null>("grid");

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <ToggleGroup aria-label="Layout" variant="bordered" className="self-end" value={layout} onValueChange={setLayout}>
        <ToggleGroupItem value="list" isIconOnly aria-label="List">
          <ListIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="grid" isIconOnly aria-label="Grid">
          <GridIcon />
        </ToggleGroupItem>
      </ToggleGroup>
      <ul className={layout === "grid" ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2"}>
        {repositories.map((name) => (
          <li key={name} className="truncate rounded-medium bg-surface-3 px-3 py-2 text-sm">
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
