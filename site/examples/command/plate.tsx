"use client";

import { Command, CommandGroup, CommandItem, Kbd, toast } from "cennge-ui";

const repositories = [
  { name: "cennge-ui", description: "React UI library", keywords: ["react", "components"] },
  { name: "ai-niche-scout", description: "Finds niches worth building for", keywords: ["startup", "ideas"] },
  { name: "payload-cache", description: "FastAPI cache service", keywords: ["python"] },
  { name: "spredo-crypto-screener", description: "Crypto screener", keywords: ["trading"] },
  { name: "playwright-msi-scraper", description: "Scraper on Playwright", keywords: ["browser"] },
];

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const icons = {
  repository: "M5 18.5V5.5A2.5 2.5 0 0 1 7.5 3H19v14H7.5A2.5 2.5 0 0 0 5 19.5 1.5 1.5 0 0 0 6.5 21H19",
  plus: "M12 5v14M5 12h14",
  release: "M20 12 12 20l-9-9V3h8l9 9ZM7.5 7.5h.01",
  archive: "M3 4h18v4H3zM5 8v12h14V8M10 12h4",
  settings: "M4 7h9m4 0h3M4 17h3m4 0h9M15 5v4M9 15v4",
};

export default function CommandPlate() {
  return (
    <Command
      label="Go to"
      placeholder="Search repositories and actions…"
      className="w-full max-w-md rounded-large border border-border bg-surface-3"
      classNames={{ list: "max-h-80" }}
    >
      <CommandGroup heading="Repositories">
        {repositories.map((repository) => (
          <CommandItem
            key={repository.name}
            icon={<Icon d={icons.repository} />}
            description={repository.description}
            keywords={repository.keywords}
            onAction={() => toast(`Opened ${repository.name}`)}
          >
            {repository.name}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandGroup heading="Actions">
        <CommandItem
          icon={<Icon d={icons.plus} />}
          shortcut={<Kbd size="sm">N</Kbd>}
          keywords={["create"]}
          onAction={() => toast("New repository")}
        >
          New repository
        </CommandItem>
        <CommandItem
          icon={<Icon d={icons.release} />}
          keywords={["publish", "npm", "version"]}
          onAction={() => toast("New release")}
        >
          New release
        </CommandItem>
        <CommandItem icon={<Icon d={icons.archive} />} description="Needs admin rights" isDisabled>
          Archive repository
        </CommandItem>
        <CommandItem icon={<Icon d={icons.settings} />} keywords={["preferences"]} onAction={() => toast("Settings")}>
          Settings
        </CommandItem>
      </CommandGroup>
    </Command>
  );
}
