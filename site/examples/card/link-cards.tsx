"use client";

import Link from "next/link";
import { Card, CardBody } from "cennge-ui";

const pages = [
  { href: "/docs/installation/", title: "Installation", summary: "npm install and two CSS imports." },
  { href: "/docs/theming/", title: "Theming", summary: "Tokens, surfaces, colour roles and the accent presets." },
  { href: "/docs/dark-mode/", title: "Dark mode", summary: "The stored theme before the first paint." },
];

export default function LinkCards() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {pages.map((page) => (
        <Card key={page.href} asChild isPressable>
          <Link href={page.href}>
            <CardBody>
              <span className="font-semibold">{page.title}</span>
              <span className="text-sm text-muted">{page.summary}</span>
            </CardBody>
          </Link>
        </Card>
      ))}
    </div>
  );
}
