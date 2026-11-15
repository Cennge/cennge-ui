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

const guides = [
  { href: "/docs/installation/", title: "Installation", description: "npm install, two CSS imports and one @source line" },
  { href: "/docs/theming/", title: "Theming", description: "Tokens, surfaces, colour roles and accents" },
  { href: "/docs/server-rendering/", title: "Next.js and SSR", description: "Server Components, hydration without warnings" },
];

/** In an app, pass usePathname() from next/navigation. */
export default function SiteHeader({ pathname = "/docs/navigation-menu/" }: { pathname?: string }) {
  return (
    <NavigationMenu aria-label="Site">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-80 gap-1">
              {guides.map((guide) => (
                <li key={guide.href}>
                  <NavigationMenuLink asChild isActive={pathname === guide.href} title={guide.title} description={guide.description}>
                    <Link href={guide.href} />
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild isActive={pathname === "/docs/navigation-menu/"}>
            <Link href="/docs/navigation-menu/">NavigationMenu</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
