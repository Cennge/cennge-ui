"use client";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "cennge-ui";

const repositories = [
  { name: "ai-niche-scout", description: "Validate an AI startup idea: competitors and 54 AI niches" },
  { name: "payload-cache", description: "FastAPI cache service" },
  { name: "spredo-crypto-screener", description: "Crypto screener" },
  { name: "playwright-msi-scraper", description: "Scraper on Playwright" },
];

export default function MoreRepositories() {
  return (
    <footer className="w-full border-t border-border pt-4 text-sm">
      <p className="text-muted">More from Cennge</p>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
        {repositories.map((repository) => (
          <li key={repository.name}>
            <HoverCard>
              <HoverCardTrigger>
                <a href={`https://github.com/Cennge/${repository.name}`} className="font-semibold hover:underline">
                  {repository.name}
                </a>
              </HoverCardTrigger>
              <HoverCardContent placement="top" showArrow className="w-60">
                <p className="font-semibold">{repository.name}</p>
                <p className="mt-1 text-muted">{repository.description}</p>
              </HoverCardContent>
            </HoverCard>
          </li>
        ))}
      </ul>
    </footer>
  );
}
