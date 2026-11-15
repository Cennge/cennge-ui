"use client";

import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  type DrawerPlacement,
} from "cennge-ui";

const placements: DrawerPlacement[] = ["left", "right", "top", "bottom"];

const repositories = [
  { name: "cennge-ui", description: "React components on Radix UI and Tailwind CSS v4" },
  { name: "ai-niche-scout", description: "Validate an AI startup idea" },
  { name: "payload-cache", description: "Caches the results of an expensive transformer" },
  { name: "spredo-crypto-screener", description: "Crypto project screener" },
  { name: "playwright-msi-scraper", description: "MSI product pages into structured JSON" },
];

export default function DrawerPlacements() {
  return (
    <div className="flex flex-wrap gap-3">
      {placements.map((placement) => (
        <Drawer key={placement}>
          <DrawerTrigger>
            <Button variant="flat">{placement[0]!.toUpperCase() + placement.slice(1)}</Button>
          </DrawerTrigger>
          <DrawerContent placement={placement}>
            <DrawerHeader>
              <DrawerTitle>Repositories</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>
              <ul className="flex flex-col gap-3">
                {repositories.map((repository) => (
                  <li key={repository.name}>
                    <p className="font-medium">{repository.name}</p>
                    <p className="text-muted">{repository.description}</p>
                  </li>
                ))}
              </ul>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  );
}
