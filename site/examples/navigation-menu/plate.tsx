"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "cennge-ui";

const components = [
  { slug: "navigation-menu", title: "NavigationMenu", description: "Site navigation with panels that stay in view" },
  { slug: "sidebar", title: "Sidebar", description: "An app sidebar that becomes a drawer on phones" },
  { slug: "tabs", title: "Tabs", description: "Panels behind a row of tabs" },
  { slug: "breadcrumbs", title: "Breadcrumbs", description: "Where the page sits in the hierarchy" },
  { slug: "pagination", title: "Pagination", description: "Page numbers with previous and next" },
  { slug: "stepper", title: "Stepper", description: "Progress through numbered steps" },
];

const repositories = [
  { name: "cennge-ui", description: "React UI library" },
  { name: "ai-niche-scout", description: "Finds niches worth building for" },
  { name: "payload-cache", description: "FastAPI cache service" },
  { name: "spredo-crypto-screener", description: "Crypto screener" },
];

export default function NavigationMenuPlate() {
  return (
    <div className="flex min-h-76 w-full flex-col">
      <header className="flex h-14 items-center justify-center rounded-large bg-surface-1 px-2">
        <NavigationMenu aria-label="Main">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Repositories</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-64 gap-1">
                  {repositories.map((repository) => (
                    <li key={repository.name}>
                      <NavigationMenuLink
                        href={`https://github.com/Cennge/${repository.name}`}
                        title={repository.name}
                        description={repository.description}
                      />
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Components</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[min(28rem,calc(100vw-2.5rem))] gap-1 sm:grid-cols-2">
                  {components.map((item) => (
                    <li key={item.slug}>
                      <NavigationMenuLink
                        asChild
                        isActive={item.slug === "navigation-menu"}
                        title={item.title}
                        description={item.description}
                      >
                        <Link href={`/docs/${item.slug}/`} />
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem className="max-sm:hidden">
              <NavigationMenuLink href="https://github.com/Cennge/cennge-ui/blob/main/CHANGELOG.md">Changelog</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </header>
    </div>
  );
}
