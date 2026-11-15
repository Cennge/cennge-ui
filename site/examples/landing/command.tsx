"use client";

import { Command, CommandGroup, CommandItem, CommandSeparator, Kbd, toast } from "cennge-ui";

const repositories = [
  { name: "cennge-ui", description: "React UI library" },
  { name: "ai-niche-scout", description: "Finds niches worth building for" },
  { name: "payload-cache", description: "FastAPI cache service" },
  { name: "spredo-crypto-screener", description: "Crypto screener" },
  { name: "playwright-msi-scraper", description: "Scraper on Playwright" },
];

export default function CommandPanel() {
  return (
    <Command label="Repositories and actions" placeholder="Search repositories and actions…" className="h-88 w-full">
      <CommandGroup heading="Repositories">
        {repositories.map((repository) => (
          <CommandItem
            key={repository.name}
            description={repository.description}
            onAction={() => toast(`Opened ${repository.name}`)}
          >
            {repository.name}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Actions">
        <CommandItem shortcut={<Kbd keys="command">N</Kbd>} onAction={() => toast("New repository")}>
          New repository
        </CommandItem>
        <CommandItem
          shortcut={<Kbd keys={["command", "shift"]}>C</Kbd>}
          onAction={() => toast.success("Copied", { description: "npm install cennge-ui" })}
        >
          Copy the install command
        </CommandItem>
      </CommandGroup>
    </Command>
  );
}
