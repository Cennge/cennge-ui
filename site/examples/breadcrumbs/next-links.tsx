"use client";

import Link from "next/link";
import { BreadcrumbItem, Breadcrumbs } from "cennge-ui";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4v-9.5Z" strokeLinejoin="round" />
    </svg>
  );
}

export default function DocsTrail() {
  return (
    <Breadcrumbs>
      <BreadcrumbItem asChild>
        <Link href="/">
          <HomeIcon />
          cennge-ui
        </Link>
      </BreadcrumbItem>
      <BreadcrumbItem asChild>
        <Link href="/docs/">Docs</Link>
      </BreadcrumbItem>
      <BreadcrumbItem>Breadcrumbs</BreadcrumbItem>
    </Breadcrumbs>
  );
}
