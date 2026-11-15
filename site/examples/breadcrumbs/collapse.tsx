"use client";

import { BreadcrumbItem, Breadcrumbs } from "cennge-ui";

const tree = "https://github.com/Cennge/cennge-ui/tree/main";

export default function CollapsedTrail() {
  return (
    <Breadcrumbs maxItems={4} itemsBeforeCollapse={2} aria-label="Source file">
      <BreadcrumbItem href="https://github.com/Cennge">Cennge</BreadcrumbItem>
      <BreadcrumbItem href="https://github.com/Cennge/cennge-ui">cennge-ui</BreadcrumbItem>
      <BreadcrumbItem href={`${tree}/src`}>src</BreadcrumbItem>
      <BreadcrumbItem href={`${tree}/src/components`}>components</BreadcrumbItem>
      <BreadcrumbItem href={`${tree}/src/components/navigation-menu`}>navigation-menu</BreadcrumbItem>
      <BreadcrumbItem>navigation-menu.tsx</BreadcrumbItem>
    </Breadcrumbs>
  );
}
