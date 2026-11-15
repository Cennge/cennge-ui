"use client";

import { Avatar, AvatarGroup, type CenngeColor } from "cennge-ui";

const repositories: { name: string; color: CenngeColor }[] = [
  { name: "cennge-ui", color: "primary" },
  { name: "ai-niche-scout", color: "info" },
  { name: "payload-cache", color: "success" },
  { name: "spredo-crypto-screener", color: "warning" },
  { name: "playwright-msi-scraper", color: "secondary" },
];

export default function RepositoryStack() {
  return (
    <div className="flex flex-col gap-5">
      <AvatarGroup max={3}>
        {repositories.map((repository) => (
          <Avatar key={repository.name} name={repository.name} color={repository.color} isBordered />
        ))}
      </AvatarGroup>
      {/* The group's size is the counter's: give it the avatars' size. */}
      <AvatarGroup max={4} size="lg">
        {repositories.map((repository) => (
          <Avatar key={repository.name} name={repository.name} color={repository.color} size="lg" isBordered />
        ))}
      </AvatarGroup>
    </div>
  );
}
