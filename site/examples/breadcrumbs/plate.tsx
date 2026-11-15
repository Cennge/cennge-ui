"use client";

import { BreadcrumbItem, Breadcrumbs } from "cennge-ui";

const tree = "https://github.com/Cennge/cennge-ui/tree/main";

function RepositoryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 4.5h11.5a2 2 0 0 1 2 2v13H7a2 2 0 0 1-2-2v-13Zm0 13a2 2 0 0 1 2-2h11.5" strokeLinejoin="round" />
    </svg>
  );
}

function Trail({ maxItems, label, withIcon = false }: { maxItems?: number; label: string; withIcon?: boolean }) {
  return (
    <Breadcrumbs maxItems={maxItems} aria-label={label}>
      <BreadcrumbItem href="https://github.com/Cennge/cennge-ui" startContent={withIcon ? <RepositoryIcon /> : undefined}>
        cennge-ui
      </BreadcrumbItem>
      <BreadcrumbItem href={`${tree}/src`}>src</BreadcrumbItem>
      <BreadcrumbItem href={`${tree}/src/components`}>components</BreadcrumbItem>
      <BreadcrumbItem href={`${tree}/src/components/breadcrumbs`}>breadcrumbs</BreadcrumbItem>
      <BreadcrumbItem>breadcrumbs.tsx</BreadcrumbItem>
    </Breadcrumbs>
  );
}

export default function BreadcrumbsPlate() {
  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-2.5 rounded-large bg-surface-1 px-4 py-3.5">
        <Trail maxItems={3} label="File path" />
        <p className="text-xs text-muted">144 lines · TypeScript</p>
      </div>
      <div className="max-w-80 px-4">
        <Trail label="File path, in full" withIcon />
      </div>
    </div>
  );
}
