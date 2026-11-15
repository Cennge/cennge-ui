"use client";

import { Badge, Carousel, CarouselContent, CarouselControls, CarouselItem } from "cennge-ui";

const releases = [
  { version: "0.3.1", kind: "Patch", summary: "The README's map examples are set in New York." },
  { version: "0.3.0", kind: "Minor", summary: "Charts in a new entry, cennge-ui/charts, drawn in SVG with no chart library underneath." },
  { version: "0.2.0", kind: "Minor", summary: "Maps in a new entry, cennge-ui/map, on MapLibre GL with a base map in the theme's colours." },
  { version: "0.1.1", kind: "Patch", summary: "Calendar and DatePicker limits accept null, meaning no limit." },
  { version: "0.1.0", kind: "Minor", summary: "First release: React components on Radix and Tailwind CSS v4, dark-first with a swappable accent." },
];

export default function ReleasesCarousel() {
  return (
    <Carousel aria-label="Releases" className="w-full">
      <CarouselContent>
        {releases.map((release) => (
          <CarouselItem key={release.version}>
            <div className="flex h-full min-h-44 flex-col gap-3 rounded-large bg-surface-3 p-5 sm:p-6">
              <div className="flex items-center gap-2.5">
                <p className="text-lg font-semibold">cennge-ui {release.version}</p>
                <Badge size="sm" color={release.kind === "Minor" ? "primary" : "default"}>
                  {release.kind}
                </Badge>
              </div>
              <p className="text-pretty text-muted">{release.summary}</p>
              <a
                href={`https://github.com/Cennge/cennge-ui/blob/main/CHANGELOG.md#${release.version.replaceAll(".", "")}`}
                className="mt-auto self-start rounded-small text-sm font-medium text-primary-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline-solid"
              >
                What changed in {release.version}
              </a>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselControls />
    </Carousel>
  );
}
