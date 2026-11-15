"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "cennge-ui";

const changelog = "https://github.com/Cennge/cennge-ui/blob/main/CHANGELOG.md";

const releases = [
  { version: "0.3.0", notes: "Charts, and theme switching without a flash" },
  { version: "0.2.0", notes: "Maps on MapLibre GL" },
  { version: "0.1.0", notes: "First release" },
];

const repositories = ["cennge-ui", "ai-niche-scout", "payload-cache", "playwright-msi-scraper"];

export default function ClickMenu() {
  return (
    <NavigationMenu aria-label="Project" openOn="click">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Releases</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-72 gap-1">
              {releases.map((release) => (
                <li key={release.version}>
                  <NavigationMenuLink
                    href={`${changelog}#${release.version.replaceAll(".", "")}`}
                    title={`cennge-ui@${release.version}`}
                    description={release.notes}
                  />
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Repositories</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-56 gap-1">
              {repositories.map((name) => (
                <li key={name}>
                  <NavigationMenuLink href={`https://github.com/Cennge/${name}`}>{name}</NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
