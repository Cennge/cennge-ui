"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLayout,
  SidebarNav,
  SidebarTrigger,
} from "cennge-ui";

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Row = { name: string; detail: string };

const pages: { id: string; label: string; icon: string; rows: Row[] }[] = [
  {
    id: "code",
    label: "Code",
    icon: "m8 7-5 5 5 5m8-10 5 5-5 5",
    rows: [
      { name: "src", detail: "The components" },
      { name: "e2e", detail: "Playwright specs" },
      { name: "playground", detail: "Fixtures the specs open" },
      { name: "site", detail: "These docs" },
      { name: "CHANGELOG.md", detail: "Every release" },
    ],
  },
  {
    id: "actions",
    label: "Actions",
    icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-2-12.5v7l5.5-3.5L10 8.5Z",
    rows: [
      { name: "Typecheck, test, build", detail: "CI" },
      { name: "Next.js · server rendering and hydration", detail: "CI" },
      { name: "Playwright", detail: "CI" },
      { name: "Docs site", detail: "CI" },
      { name: "Version pull request or publish", detail: "Release" },
    ],
  },
  {
    id: "releases",
    label: "Releases",
    icon: "M3.5 12.5v-8a1 1 0 0 1 1-1h8l8 8-9 9-8-8Zm4.5-4.5h.01",
    rows: [
      { name: "0.3.1", detail: "README maps set in New York" },
      { name: "0.3.0", detail: "Charts, theme switching" },
      { name: "0.2.0", detail: "Maps" },
      { name: "0.1.1", detail: "Calendar limits accept null" },
      { name: "0.1.0", detail: "First release" },
    ],
  },
];

function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
        <SidebarTrigger />
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">{children}</div>
    </div>
  );
}

export default function SidebarPlate() {
  const [current, setCurrent] = useState("code");
  const page = pages.find((item) => item.id === current) ?? pages[0]!;
  // Stands in for a router: the links change the page without leaving this one.
  const go = (id: string) => (event: MouseEvent) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    setCurrent(id);
  };

  return (
    <div className="h-[29rem] w-full overflow-hidden rounded-large border border-border bg-background">
      <SidebarLayout className="h-full min-h-0">
        <Sidebar label="cennge-ui repository" className="h-full w-52">
          <SidebarHeader className="px-4">
            <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 4.5h11.5a2 2 0 0 1 2 2v13H7a2 2 0 0 1-2-2v-13Zm0 13a2 2 0 0 1 2-2h11.5" strokeLinejoin="round" />
            </svg>
            <span className="truncate text-sm font-bold group-data-[collapsed]/sidebar:sr-only">cennge-ui</span>
          </SidebarHeader>
          <SidebarNav label="Repository">
            {pages.map((item) => (
              <SidebarItem
                key={item.id}
                href={`#${item.id}`}
                isActive={item.id === current}
                icon={<Icon d={item.icon} />}
                endContent={item.id === "releases" ? String(item.rows.length) : undefined}
                onClick={go(item.id)}
              >
                {item.label}
              </SidebarItem>
            ))}
          </SidebarNav>
          <SidebarFooter>
            <SidebarItem
              href="#settings"
              isActive={current === "settings"}
              icon={<Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2-1.2L14.5 3h-5l-.4 2.6a7.5 7.5 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 2 1.2l.4 2.6h5l.4-2.6a7.5 7.5 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z" />}
              onClick={go("settings")}
            >
              Settings
            </SidebarItem>
          </SidebarFooter>
        </Sidebar>
        <Page title={current === "settings" ? "Settings" : page.label}>
          {current === "settings" ? (
            <p className="text-sm text-muted">Visibility, collaborators and branch rules of cennge-ui.</p>
          ) : (
            <ul className="divide-y divide-border rounded-large border border-border">
              {page.rows.map((row) => (
                <li key={row.name} className="flex flex-col gap-0.5 px-3.5 py-2">
                  <span className="truncate text-sm font-medium">{row.name}</span>
                  <span className="truncate text-xs text-muted">{row.detail}</span>
                </li>
              ))}
            </ul>
          )}
        </Page>
      </SidebarLayout>
    </div>
  );
}
