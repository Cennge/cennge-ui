"use client";

import { BreadcrumbItem, Breadcrumbs } from "cennge-ui";

export default function TrailSizes() {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs size="sm" separator="/" aria-label="Breadcrumb, small">
        <BreadcrumbItem href="https://github.com/Cennge">Cennge</BreadcrumbItem>
        <BreadcrumbItem href="https://github.com/Cennge/ai-niche-scout">ai-niche-scout</BreadcrumbItem>
        <BreadcrumbItem>Settings</BreadcrumbItem>
      </Breadcrumbs>
      <Breadcrumbs size="lg" aria-label="Breadcrumb, large">
        <BreadcrumbItem href="https://github.com/Cennge">Cennge</BreadcrumbItem>
        <BreadcrumbItem href="https://github.com/Cennge/spredo-crypto-screener">spredo-crypto-screener</BreadcrumbItem>
        <BreadcrumbItem>Releases</BreadcrumbItem>
      </Breadcrumbs>
    </div>
  );
}
