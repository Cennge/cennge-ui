"use client";

import { useState } from "react";
import { Button, EmptyState, Input } from "cennge-ui";

const repositories = [
  { name: "cennge-ui", description: "React UI library" },
  { name: "ai-niche-scout", description: "Finds niches worth building for" },
  { name: "payload-cache", description: "FastAPI cache service" },
  { name: "spredo-crypto-screener", description: "Crypto screener" },
  { name: "playwright-msi-scraper", description: "Scraper on Playwright" },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

export default function EmptyStatePlate() {
  const [query, setQuery] = useState("kotlin");
  const matches = repositories.filter((repository) => repository.name.includes(query.trim().toLowerCase()));

  return (
    <div className="flex w-full flex-col gap-3">
      <Input
        aria-label="Find a repository"
        placeholder="Find a repository"
        value={query}
        onValueChange={setQuery}
        isClearable
        startContent={<SearchIcon />}
      />
      {matches.length ? (
        <ul className="flex flex-col rounded-large bg-surface-3 py-1.5">
          {matches.map((repository) => (
            <li key={repository.name} className="flex flex-col px-4 py-2">
              <span className="text-sm font-medium">{repository.name}</span>
              <span className="text-xs text-muted">{repository.description}</span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          variant="bordered"
          size="sm"
          icon={<SearchIcon />}
          title={`No repository matches “${query}”`}
          description="Search looks at repository names in Cennge."
          actions={
            <Button size="sm" variant="flat" onClick={() => setQuery("")}>
              Clear search
            </Button>
          }
        />
      )}
    </div>
  );
}
