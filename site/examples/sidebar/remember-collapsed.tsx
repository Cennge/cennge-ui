"use client";

import { Sidebar, SidebarHeader, SidebarItem, SidebarLayout, SidebarNav, SidebarTrigger } from "cennge-ui";

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const repository = "https://github.com/Cennge/payload-cache";

const links = [
  { href: repository, label: "Code", icon: "m8 7-5 5 5 5m8-10 5 5-5 5" },
  { href: `${repository}/issues`, label: "Issues", icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-8.5v.01" },
  { href: `${repository}/pulls`, label: "Pull requests", icon: "M6 3v12m0 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm12 6V9a4 4 0 0 0-4-4h-3" },
  { href: `${repository}/actions`, label: "Actions", icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-2-12.5v7l5.5-3.5L10 8.5Z" },
];

function saveCollapsed(isCollapsed: boolean) {
  document.cookie = `sidebar-collapsed=${isCollapsed}; path=/; max-age=31536000; samesite=lax`;
}

/** Read the sidebar-collapsed cookie on the server and pass it in. */
export default function RepositoryShell({ defaultCollapsed = false }: { defaultCollapsed?: boolean }) {
  return (
    <div className="h-72 w-full overflow-hidden rounded-large border border-border bg-background">
      <SidebarLayout className="h-full min-h-0" defaultCollapsed={defaultCollapsed} onCollapsedChange={saveCollapsed}>
        <Sidebar label="payload-cache" className="h-full w-56">
          <SidebarHeader className="px-4">
            <span className="truncate text-sm font-bold group-data-[collapsed]/sidebar:sr-only">Cennge</span>
          </SidebarHeader>
          <SidebarNav label="payload-cache">
            {links.map((link) => (
              <SidebarItem key={link.label} href={link.href} icon={<Icon d={link.icon} />}>
                {link.label}
              </SidebarItem>
            ))}
          </SidebarNav>
        </Sidebar>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
            <SidebarTrigger />
            <span className="text-sm font-semibold">payload-cache</span>
          </div>
          <p className="p-5 text-sm text-muted">FastAPI cache service.</p>
        </div>
      </SidebarLayout>
    </div>
  );
}
