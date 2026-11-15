"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CommandDialog, CommandGroup, CommandItem, Kbd } from "cennge-ui";
import { nav } from "@/lib/nav";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * ⌘K (Ctrl+K) from anywhere: every page by title, summary and keywords. In the header it shrinks to an
 * icon on phones; elsewhere (the 404 page) it stays a field.
 */
export function Search({ shrinksOnPhones = true }: { shrinksOnPhones?: boolean }) {
  const router = useRouter();
  const [isOpen, setOpen] = useState(false);
  // The shortcut hint names the key this device uses; the server and first render say Ctrl.
  const [isMac, setMac] = useState(false);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex h-9 w-full max-w-[21rem] cursor-pointer items-center gap-2.5 rounded-medium bg-surface-2 pr-1.5 pl-3 text-sm text-muted transition-colors duration-(--cennge-duration-fast) hover:bg-surface-3 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline-solid ${shrinksOnPhones ? "max-sm:size-9 max-sm:justify-center max-sm:bg-transparent max-sm:p-0" : ""}`}
        aria-keyshortcuts="Control+K Meta+K"
      >
        <SearchIcon />
        <span className={`truncate ${shrinksOnPhones ? "max-sm:sr-only" : ""}`}>Search the docs</span>
        {/* aria-keyshortcuts announces the shortcut; the key cap is for the eye. */}
        <Kbd keys={isMac ? ["command"] : ["ctrl"]} className="ml-auto max-sm:hidden" aria-hidden="true">
          K
        </Kbd>
      </button>
      <CommandDialog
        isOpen={isOpen}
        onOpenChange={setOpen}
        label="Search the docs"
        placeholder="Search components and guides…"
        emptyContent="Nothing by that name. Try a component, like Combobox, or a word, like modal."
      >
        {nav.map((family) => (
          <CommandGroup key={family.title} heading={family.title}>
            {family.pages.map((page) => (
              <CommandItem
                key={page.slug}
                value={page.title}
                keywords={[page.summary, family.title, ...(page.keywords ?? [])]}
                description={page.summary}
                onAction={() => router.push(`/docs/${page.slug}/`)}
              >
                {page.title}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandDialog>
    </>
  );
}
