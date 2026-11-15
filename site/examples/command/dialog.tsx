"use client";

import { useState } from "react";
import { Button, CommandDialog, CommandGroup, CommandItem, Kbd, toast } from "cennge-ui";

const repositories = ["cennge-ui", "ai-niche-scout", "payload-cache", "spredo-crypto-screener", "playwright-msi-scraper"];

export default function CommandPalette() {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <Button variant="flat" onClick={() => setOpen(true)}>
        Open the palette
      </Button>
      <p className="text-sm text-muted">
        or press <Kbd keys="command">J</Kbd> or <Kbd keys="ctrl">J</Kbd>
      </p>

      <CommandDialog
        isOpen={isOpen}
        onOpenChange={setOpen}
        shortcut="mod+j"
        label="Command palette"
        placeholder="Search repositories and actions…"
      >
        <CommandGroup heading="Repositories">
          {repositories.map((name) => (
            <CommandItem key={name} onAction={() => toast(`Opened ${name}`)}>
              {name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem keywords={["create"]} onAction={() => toast("New repository")}>
            New repository
          </CommandItem>
          <CommandItem keywords={["publish", "npm"]} onAction={() => toast("New release")}>
            New release
          </CommandItem>
        </CommandGroup>
      </CommandDialog>
    </>
  );
}
