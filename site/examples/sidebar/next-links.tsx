"use client";

import Link from "next/link";
import { Sidebar, SidebarGroup, SidebarItem, SidebarLayout, SidebarNav, SidebarTrigger } from "cennge-ui";

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const guides = [
  { href: "/docs/installation/", title: "Installation", summary: "npm install, two CSS imports and one @source line.", icon: "M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" },
  { href: "/docs/theming/", title: "Theming", summary: "Tokens, surfaces, colour roles, the accent presets and your own colours.", icon: "M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.5 0-1.2-1-1.5-1-2.5s.8-1.5 2-1.5H17a4 4 0 0 0 4-4c0-4.7-4-8.5-9-8.5Z" },
  { href: "/docs/dark-mode/", title: "Dark mode", summary: "ThemeScript, useTheme and ThemeSwitch: the stored theme before the first paint.", icon: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" },
  { href: "/docs/forms/", title: "Forms", summary: "Controlled and uncontrolled fields, server errors under their fields.", icon: "M5 4.5h14v15H5zM9 9h6m-6 4h6m-6 4h3" },
];

const components = [
  { href: "/docs/sidebar/", title: "Sidebar", summary: "An app sidebar that becomes a drawer on phones.", icon: "M4.5 4.5h15v15h-15zM10 4.5v15" },
  { href: "/docs/tabs/", title: "Tabs", summary: "Panels behind a row of tabs.", icon: "M3.5 19.5v-12h6v3h11v9z" },
];

/** In an app, pass usePathname() from next/navigation. */
export default function DocsShell({ pathname = "/docs/sidebar/" }: { pathname?: string }) {
  const current = [...guides, ...components].find((page) => page.href === pathname);
  return (
    <div className="h-80 w-full overflow-hidden rounded-large border border-border bg-background">
      <SidebarLayout className="h-full min-h-0">
        <Sidebar label="Guides" className="h-full w-56">
          <SidebarNav label="Guides">
            <SidebarGroup label="Getting started">
              {guides.map((page) => (
                <SidebarItem key={page.href} asChild isActive={page.href === pathname} icon={<Icon d={page.icon} />}>
                  <Link href={page.href}>{page.title}</Link>
                </SidebarItem>
              ))}
            </SidebarGroup>
            <SidebarGroup label="Components">
              {components.map((page) => (
                <SidebarItem key={page.href} asChild isActive={page.href === pathname} icon={<Icon d={page.icon} />}>
                  <Link href={page.href}>{page.title}</Link>
                </SidebarItem>
              ))}
            </SidebarGroup>
          </SidebarNav>
        </Sidebar>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
            <SidebarTrigger />
            <span className="text-sm font-semibold">{current?.title}</span>
          </div>
          <p className="p-5 text-sm text-muted">{current?.summary}</p>
        </div>
      </SidebarLayout>
    </div>
  );
}
