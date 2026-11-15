"use client";

import { Carousel, CarouselContent, CarouselControls, CarouselItem } from "cennge-ui";

const repositories = [
  { name: "cennge-ui", description: "React UI library" },
  { name: "ai-niche-scout", description: "Finds niches worth building for" },
  { name: "payload-cache", description: "FastAPI cache service" },
  { name: "spredo-crypto-screener", description: "Crypto screener" },
  { name: "playwright-msi-scraper", description: "Scraper on Playwright" },
];

export default function RepositoryCarousel() {
  return (
    <Carousel
      aria-label="Repositories"
      gap="0.75rem"
      // 1.2 on phones shows the edge of the next card; two from 640px, three from 1024px.
      className="w-full [--carousel-per-view:1.2] sm:[--carousel-per-view:2] lg:[--carousel-per-view:3]"
    >
      <CarouselContent>
        {repositories.map((repository) => (
          <CarouselItem key={repository.name}>
            <div className="flex h-28 flex-col justify-between rounded-large bg-surface-3 p-4">
              <span className="truncate font-semibold">{repository.name}</span>
              <span className="text-sm text-muted">{repository.description}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselControls />
    </Carousel>
  );
}
