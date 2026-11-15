"use client";

import { Sidebar, SidebarFooter, SidebarItem, SidebarLayout, SidebarNav, SidebarTrigger, useTheme } from "cennge-ui";

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const repository = "https://github.com/Cennge/ai-niche-scout";
const moon = "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z";
const sun = "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-13v1.5m0 15V21M3 12h1.5m15 0H21M5.6 5.6l1.1 1.1m10.6 10.6 1.1 1.1m0-12.8-1.1 1.1M6.7 17.3l-1.1 1.1";

export default function ThemeInFooter() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  return (
    <div className="h-64 w-full overflow-hidden rounded-large border border-border bg-background">
      <SidebarLayout className="h-full min-h-0">
        <Sidebar label="ai-niche-scout" className="h-full w-56">
          <SidebarNav label="ai-niche-scout">
            <SidebarItem href={repository} icon={<Icon d="m8 7-5 5 5 5m8-10 5 5-5 5" />}>
              Code
            </SidebarItem>
            <SidebarItem href={`${repository}/issues`} icon={<Icon d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-8.5v.01" />}>
              Issues
            </SidebarItem>
          </SidebarNav>
          <SidebarFooter>
            {/* A setting, not a page: on phones the drawer stays open to show the change. */}
            <SidebarItem keepDrawerOpen icon={<Icon d={isDark ? sun : moon} />} onClick={() => setTheme(isDark ? "light" : "dark")}>
              {isDark ? "Light theme" : "Dark theme"}
            </SidebarItem>
          </SidebarFooter>
        </Sidebar>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
            <SidebarTrigger />
            <span className="text-sm font-semibold">ai-niche-scout</span>
          </div>
          <p className="p-5 text-sm text-muted">Finds niches worth building for.</p>
        </div>
      </SidebarLayout>
    </div>
  );
}
