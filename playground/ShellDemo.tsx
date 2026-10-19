import { useState, type ReactNode } from "react";
import {
  Avatar,
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarLayout,
  SidebarNav,
  SidebarTrigger,
} from "cennge-ui";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-large bg-surface-2 p-6 shadow-raised">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const pages = [
  { id: "overview", label: "Обзор", icon: "M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-4H4v4Zm10-16v4h6V4h-6Z" },
  { id: "issues", label: "Issues", icon: "M12 8v5M12 16v.5M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", count: "12" },
  { id: "pulls", label: "Pull requests", icon: "M6 3v12M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM18 21V9a4 4 0 0 0-4-4h-3", count: "3" },
  { id: "actions", label: "Actions", icon: "M8 5v14l11-7L8 5Z" },
  { id: "settings", label: "Настройки", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" },
];

export function ShellDemo() {
  const [page, setPage] = useState("overview");
  const current = pages.find((item) => item.id === page);
  // In an app these are Next.js links: <SidebarItem asChild isActive={…}><Link href="/issues">…</Link></SidebarItem>
  const go = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    setPage(id);
  };

  return (
    <Section title="Sidebar">
      <SidebarLayout className="h-[28rem] min-h-0 overflow-hidden rounded-large border border-border bg-surface-1">
        <Sidebar label="Навигация по ai-niche-scout" className="static h-full">
          <SidebarHeader>
            <span className="flex size-7 shrink-0 items-center justify-center rounded-medium bg-primary text-xs font-bold text-primary-foreground">
              ai
            </span>
            <span className="truncate font-semibold group-data-[collapsed]/sidebar:sr-only">ai-niche-scout</span>
          </SidebarHeader>
          <SidebarNav label="Репозиторий">
            <SidebarGroup label="Репозиторий">
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
            <div className="flex items-center gap-2 px-1.5 py-1 group-data-[collapsed]/sidebar:justify-center">
              <Avatar name="Cennge" size="sm" />
              <span className="truncate text-sm group-data-[collapsed]/sidebar:sr-only">Cennge</span>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
            <SidebarTrigger
              labels={{ open: "Открыть навигацию", collapse: "Свернуть панель", expand: "Развернуть панель" }}
            />
            <h3 className="text-sm font-semibold">{current?.label}</h3>
          </header>
          <div className="p-5 text-sm text-muted">
            На широком экране панель сворачивается до иконок (подписи — во всплывающих подсказках). На телефоне она
            открывается кнопкой меню и закрывается после выбора раздела — в том числе с Next.js Link, который
            отменяет клик для перехода без перезагрузки.
          </div>
        </div>
      </SidebarLayout>
    </Section>
  );
}
