"use client";

import { Badge, Snippet, Tabs, TabsContent, TabsList, TabsTrigger } from "cennge-ui";

const versions = [
  { version: "0.3.1", notes: "README maps set in New York" },
  { version: "0.3.0", notes: "Charts, theme switching without a flash" },
  { version: "0.2.0", notes: "Maps on MapLibre GL" },
  { version: "0.1.1", notes: "Calendar limits accept null" },
  { version: "0.1.0", notes: "First release" },
];

const dependencies = [
  { name: "radix-ui", range: "^1.8.1" },
  { name: "tailwind-variants", range: "^3.3.1" },
  { name: "tailwind-merge", range: "^3.7.0" },
  { name: "clsx", range: "^2.1.1" },
];

const managers = [
  { value: "npm", command: "npm install cennge-ui" },
  { value: "pnpm", command: "pnpm add cennge-ui" },
  { value: "yarn", command: "yarn add cennge-ui" },
  { value: "bun", command: "bun add cennge-ui" },
];

const row = "flex items-baseline justify-between gap-4 py-2 text-sm";

export default function TabsPlate() {
  return (
    <div className="flex w-full flex-col gap-8">
      <Tabs defaultValue="versions">
        <TabsList aria-label="cennge-ui on npm">
          <TabsTrigger value="readme">Readme</TabsTrigger>
          <TabsTrigger value="versions">
            Versions{" "}
            <Badge size="sm" className="max-sm:hidden">{versions.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="dependencies">
            Dependencies{" "}
            <Badge size="sm" className="max-sm:hidden">{dependencies.length}</Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="readme" className="flex min-h-48 flex-col gap-2 text-sm">
          <p className="font-semibold">Tactile, dark-first React components on Radix UI and Tailwind CSS v4.</p>
          <p className="text-muted">A regular npm package: npm update and every app gets the fix.</p>
        </TabsContent>
        <TabsContent value="versions" className="min-h-48">
          <ul className="divide-y divide-border">
            {versions.map((item) => (
              <li key={item.version} className={row}>
                <span className="font-medium tabular-nums">{item.version}</span>
                <span className="truncate text-muted">{item.notes}</span>
              </li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="dependencies" className="min-h-48">
          <ul className="divide-y divide-border">
            {dependencies.map((item) => (
              <li key={item.name} className={row}>
                <span className="font-medium">{item.name}</span>
                <code className="font-code text-[13px] text-muted">{item.range}</code>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>

      <Tabs defaultValue="npm" variant="underlined" color="primary" size="sm" className="gap-3">
        <TabsList aria-label="Package manager">
          {managers.map((manager) => (
            <TabsTrigger key={manager.value} value={manager.value}>
              {manager.value}
            </TabsTrigger>
          ))}
        </TabsList>
        {managers.map((manager) => (
          <TabsContent key={manager.value} value={manager.value}>
            <Snippet className="w-full">{manager.command}</Snippet>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
