"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState, type ReactNode } from "react";
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLayout,
  SidebarNav,
  SidebarTrigger,
  ThemeSwitch,
} from "cennge-ui";
import { nav, type NavFamily } from "@/lib/nav";
import { AccentSwitch } from "./accent-switch";
import { BrandMark } from "./brand-mark";
import { Search } from "./search";

export const repository = "https://github.com/Cennge/cennge-ui";
export const themeOptions = { defaultTheme: "dark" } as const;

function Chevron({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`size-3.5 shrink-0 text-muted transition-transform duration-(--cennge-duration) ease-tactile motion-reduce:transition-none ${isOpen ? "rotate-90" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      aria-hidden="true"
    >
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

/** A family of pages that folds; the one holding the current page starts open. */
function Family({ family, current }: { family: NavFamily; current: string | undefined }) {
  const holdsCurrent = family.pages.some((page) => page.slug === current);
  const [isOpen, setOpen] = useState(holdsCurrent || family.title === "Getting started");
  const listId = useId();
  // Arriving from search or a link: the family of the new page opens.
  useEffect(() => {
    if (holdsCurrent) setOpen(true);
  }, [holdsCurrent]);

  return (
    <div>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setOpen(!isOpen)}
        className="flex h-8 w-full cursor-pointer items-center justify-between gap-2 rounded-small px-2.5 text-left text-sm font-semibold text-foreground transition-colors duration-(--cennge-duration-fast) hover:bg-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary focus-visible:outline-solid"
      >
        {family.title}
        <Chevron isOpen={isOpen} />
      </button>
      <ul id={listId} hidden={!isOpen} className="mt-0.5 mb-2 ml-2 flex flex-col gap-px">
        {family.pages.map((page) => {
          const isActive = page.slug === current;
          return (
            <li key={page.slug}>
              <SidebarItem
                asChild
                isActive={isActive}
                className="h-7 text-sm font-normal text-muted hover:text-foreground data-[active]:bg-primary/15 data-[active]:font-medium data-[active]:text-primary-text"
              >
                <Link href={`/docs/${page.slug}/`}>{page.title}</Link>
              </SidebarItem>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function DocsShell({ version, children }: { version: string; children: ReactNode }) {
  const pathname = usePathname();
  const current = /^\/docs\/([^/]+)/.exec(pathname)?.[1];

  return (
    <SidebarLayout>
      <a
        href="#content"
        className="fixed top-2 left-2 z-50 -translate-y-16 rounded-medium bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground focus-visible:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline-solid motion-safe:transition-transform"
      >
        Skip to content
      </a>
      <Sidebar label="Documentation" className="w-62 border-r-0">
        <SidebarHeader className="h-14 px-5">
          {/* Links to the landing do not prefetch it: its stylesheet would be preloaded on every docs page, unused. */}
          <Link
            href="/"
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-small text-lg font-bold tracking-[-0.015em] text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary focus-visible:outline-solid"
          >
            <BrandMark />
            cennge-ui
          </Link>
        </SidebarHeader>
        <SidebarNav label="Docs" className="gap-0 px-3 pt-3 pb-8">
          {nav.map((family) => (
            <Family key={family.title} family={family} current={current} />
          ))}
        </SidebarNav>
        {/* Below lg the header has no room for these: they live at the foot of the column (the drawer on phones). */}
        <SidebarFooter className="flex flex-col items-start gap-3 border-t-0 bg-surface-2 p-4 lg:hidden">
          <ThemeSwitch {...themeOptions} />
          <AccentSwitch />
        </SidebarFooter>
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 sm:px-6 lg:px-10">
          <SidebarTrigger className="md:hidden" labels={{ open: "Open the docs menu" }} />
          <Link href="/" prefetch={false} className="inline-flex items-center gap-2 text-lg font-bold tracking-[-0.015em] md:hidden">
            <BrandMark />
            cennge-ui
          </Link>
          <div className="flex flex-1 justify-end sm:justify-start">
            <Search />
          </div>
          <div className="flex items-center gap-4 max-lg:hidden">
            <ThemeSwitch {...themeOptions} />
            <AccentSwitch />
          </div>
          <a
            href={repository}
            className="flex items-center gap-2 rounded-small text-sm font-medium text-muted transition-colors duration-(--cennge-duration-fast) hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline-solid"
          >
            <GitHubIcon />
            <span className="max-lg:sr-only">GitHub</span>
          </a>
          <a
            href={`${repository}/blob/main/CHANGELOG.md`}
            className="shrink-0 rounded-small bg-surface-3 px-2 py-1 text-[13px] font-medium tabular-nums text-foreground transition-colors duration-(--cennge-duration-fast) hover:bg-surface-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline-solid max-lg:hidden"
          >
            v{version}
            <span className="sr-only">, changelog</span>
          </a>
        </header>
        <main id="content" className="flex-1">
          {children}
        </main>
      </div>
    </SidebarLayout>
  );
}
