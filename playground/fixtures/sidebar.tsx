import { useState } from "react";
import {
  Sidebar,
  SidebarFooter,
  SidebarGroup,
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

const pages = [
  { id: "overview", label: "Overview", icon: "M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-4H4v4Zm10-16v4h6V4h-6Z" },
  { id: "issues", label: "Issues", icon: "M12 8v5M12 16v.5M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", count: "12" },
  { id: "pulls", label: "Pull requests", icon: "M6 3v12M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM18 21V9a4 4 0 0 0-4-4h-3" },
  { id: "actions", label: "Actions", icon: "M8 5v14l11-7L8 5Z" },
];

export default function SidebarFixture() {
  const [page, setPage] = useState("overview");
  // A stand-in for a router: links change the page without leaving it.
  const go = (id: string) => (event: React.MouseEvent) => {
    if (event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    setPage(id);
  };

  return (
    <SidebarLayout className="-m-6 min-h-[36rem]">
      <Sidebar label="Cennge/cennge-ui">
        <SidebarHeader>
          <span className="truncate font-bold group-data-[collapsed]/sidebar:sr-only">cennge-ui</span>
        </SidebarHeader>
        <SidebarNav>
          <SidebarGroup label="Repository">
            {pages.map((item) => (
              <SidebarItem
                key={item.id}
                href={`#${item.id}`}
                isActive={page === item.id}
                icon={<Icon d={item.icon} />}
                endContent={item.count}
                onClick={go(item.id)}
              >
                {item.label}
              </SidebarItem>
            ))}
          </SidebarGroup>
        </SidebarNav>
        <SidebarFooter>
          <SidebarItem icon={<Icon d="M15 7l5 5-5 5M20 12H9M12 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" />}>Sign out</SidebarItem>
        </SidebarFooter>
      </Sidebar>
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b border-border px-3">
          <SidebarTrigger />
          <h1 className="text-sm font-semibold" data-testid="page">
            {pages.find((item) => item.id === page)?.label}
          </h1>
        </header>
        <div className="p-6 text-sm text-muted">Content</div>
      </main>
    </SidebarLayout>
  );
}
