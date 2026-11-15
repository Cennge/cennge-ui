"use client";

import { useState } from "react";
import { Input } from "cennge-ui";

const repositories = [
  { name: "cennge-ui", description: "React UI library" },
  { name: "ai-niche-scout", description: "Finds niches worth building for" },
  { name: "payload-cache", description: "FastAPI cache service" },
  { name: "spredo-crypto-screener", description: "Crypto screener" },
  { name: "playwright-msi-scraper", description: "Scraper on Playwright" },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" strokeLinecap="round" />
    </svg>
  );
}

export default function InputPlate() {
  const [query, setQuery] = useState("scr");
  const [name, setName] = useState("Payload Cache");

  const matches = repositories.filter((repository) => repository.name.includes(query.trim().toLowerCase()));
  const isNameValid = /^[a-z0-9-]+$/.test(name);

  return (
    <div className="flex w-full max-w-md flex-col gap-7">
      <div className="flex flex-col gap-2">
        <Input
          type="search"
          label="Repositories"
          placeholder="Find a repository"
          startContent={<SearchIcon />}
          isClearable
          value={query}
          onValueChange={setQuery}
        />
        <ul className="flex flex-col">
          {matches.map((repository) => (
            <li key={repository.name} className="flex flex-wrap items-baseline justify-between gap-x-4 px-3 py-1.5 text-sm">
              <span className="font-medium">{repository.name}</span>
              <span className="text-muted">{repository.description}</span>
            </li>
          ))}
          {matches.length === 0 ? <li className="px-3 py-1.5 text-sm text-muted">No repository matches “{query}”.</li> : null}
        </ul>
      </div>
      <Input
        label="Package name"
        isRequired
        value={name}
        onValueChange={setName}
        description="Lowercase letters, digits and dashes"
        isInvalid={!isNameValid}
        errorMessage="Only lowercase letters, digits and dashes, like payload-cache"
      />
    </div>
  );
}
