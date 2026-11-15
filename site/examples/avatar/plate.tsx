"use client";

import { Avatar, AvatarGroup, type CenngeColor } from "cennge-ui";

const repositories: { name: string; description: string; color: CenngeColor }[] = [
  { name: "cennge-ui", description: "React UI library", color: "primary" },
  { name: "ai-niche-scout", description: "Finds niches worth building for", color: "info" },
  { name: "payload-cache", description: "FastAPI cache service", color: "success" },
  { name: "spredo-crypto-screener", description: "Crypto screener", color: "warning" },
  { name: "playwright-msi-scraper", description: "Scraper on Playwright", color: "secondary" },
];

export default function AvatarPlate() {
  return (
    <div className="flex w-full max-w-md flex-col gap-7">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="flex items-center gap-4">
          <Avatar src="/avatar.svg" name="Cennge" size="xl" />
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Cennge</span>
            <span className="text-sm text-muted">github.com/Cennge</span>
          </div>
        </div>
        <AvatarGroup max={3}>
          {repositories.map((repository) => (
            <Avatar key={repository.name} name={repository.name} color={repository.color} isBordered />
          ))}
        </AvatarGroup>
      </div>
      <ul className="flex flex-col gap-3.5">
        {repositories.map((repository) => (
          <li key={repository.name} className="flex items-center gap-3">
            <Avatar name={repository.name} color={repository.color} radius="md" />
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{repository.name}</span>
              <span className="truncate text-sm text-muted">{repository.description}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
