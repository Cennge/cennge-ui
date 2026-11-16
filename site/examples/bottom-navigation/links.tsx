"use client";

import Link from "next/link";
import { BottomNavigation, BottomNavigationItem } from "cennge-ui";

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const pages = [
  { href: "/docs/bottom-navigation/", label: "Tabs", icon: icon("M4 6h16M4 12h16M4 18h16") },
  { href: "/docs/bottom-bar/", label: "Bar", icon: icon("M4 15h16v5H4z") },
  { href: "/docs/floating-action-button/", label: "Button", icon: icon("M12 5v14M5 12h14") },
];

export default function DocsTabs() {
  // In an app, from usePathname().
  const pathname = "/docs/bottom-navigation/";

  return (
    <BottomNavigation aria-label="Mobile components" position="static" className="max-w-[22rem] rounded-large border">
      {pages.map((page) => (
        <BottomNavigationItem key={page.href} asChild icon={page.icon} label={page.label} isActive={pathname === page.href}>
          <Link href={page.href} />
        </BottomNavigationItem>
      ))}
    </BottomNavigation>
  );
}
