import { useState } from "react";
import { Button, CommandDialog, CommandGroup, CommandItem, CommandSeparator, Kbd } from "cennge-ui";

export default function CommandFixture() {
  const [isOpen, setOpen] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const run = (entry: string) => () => setLog((entries) => [...entries, entry]);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open command palette</Button>
      <p>
        log: <span data-testid="log">{log.join(",")}</span>
      </p>
      <CommandDialog label="Command palette" isOpen={isOpen} onOpenChange={setOpen}>
        <CommandGroup heading="Repositories">
          <CommandItem onAction={run("cennge-ui")} description="Tactile React components">
            cennge-ui
          </CommandItem>
          <CommandItem onAction={run("ai-niche-scout")} keywords={["python", "startup"]}>
            ai-niche-scout
          </CommandItem>
          <CommandItem onAction={run("dotfiles")}>dotfiles</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onAction={run("new")} shortcut={<Kbd keys="command">N</Kbd>}>
            New repository
          </CommandItem>
          <CommandItem onAction={run("archive")} isDisabled>
            Archive repository
          </CommandItem>
          <CommandItem onAction={run("settings")} keywords={["preferences"]}>
            Settings
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Workflows">
          {Array.from({ length: 20 }, (_, index) => (
            <CommandItem key={index} onAction={run(`workflow-${index + 1}`)}>
              {`Workflow ${index + 1}`}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandDialog>
    </>
  );
}
