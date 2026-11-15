"use client";

import { useState } from "react";
import { Select, SelectItem } from "cennge-ui";

const repositories = [
  { name: "cennge-ui", language: "TypeScript", description: "React UI library" },
  { name: "ai-niche-scout", language: "TypeScript", description: "AI startup idea validator" },
  { name: "spredo-crypto-screener", language: "TypeScript", description: "Crypto screener" },
  { name: "payload-cache", language: "Python", description: "FastAPI cache service" },
  { name: "playwright-msi-scraper", language: "JavaScript", description: "Product scraper" },
];

const languages = ["TypeScript", "Python", "JavaScript"];

export default function SelectPlate() {
  const [language, setLanguage] = useState<string | null>("TypeScript");
  const [order, setOrder] = useState<string | null>("a-z");

  const shown = repositories
    .filter((repository) => language === null || repository.language === language)
    .sort((a, b) => (order === "z-a" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)));

  return (
    <div className="flex w-full max-w-xl flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Language" placeholder="All languages" value={language} onValueChange={setLanguage} isClearable>
          {languages.map((name) => {
            const count = repositories.filter((repository) => repository.language === name).length;
            return (
              <SelectItem key={name} value={name} description={`${count} ${count === 1 ? "repository" : "repositories"}`}>
                {name}
              </SelectItem>
            );
          })}
        </Select>
        <Select label="Sort" value={order} onValueChange={setOrder}>
          <SelectItem value="a-z">Name, A to Z</SelectItem>
          <SelectItem value="z-a">Name, Z to A</SelectItem>
        </Select>
      </div>
      <ul aria-label="Repositories" className="flex flex-col divide-y divide-border rounded-large bg-surface-3">
        {shown.map((repository) => (
          <li key={repository.name} className="flex items-baseline justify-between gap-4 px-4 py-2.5 text-sm">
            <span className="min-w-0">
              <span className="font-semibold">{repository.name}</span>
              <span className="text-muted"> · {repository.description}</span>
            </span>
            <span className="shrink-0 text-xs text-muted">{repository.language}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
