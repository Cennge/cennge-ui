"use client";

import { useState } from "react";
import { Badge, Tree, type TreeItem } from "cennge-ui";

const files: TreeItem[] = [
  {
    id: ".github",
    label: ".github",
    children: [
      {
        id: ".github/workflows",
        label: "workflows",
        children: [
          { id: ".github/workflows/ci.yml", label: "ci.yml" },
          { id: ".github/workflows/release.yml", label: "release.yml" },
        ],
      },
    ],
  },
  { id: "e2e", label: "e2e", hasChildren: true },
  {
    id: "src",
    label: "src",
    children: [
      {
        id: "src/components",
        label: "components",
        children: [
          {
            id: "src/components/table",
            label: "table",
            children: [
              { id: "src/components/table/index.ts", label: "index.ts" },
              { id: "src/components/table/table.tsx", label: "table.tsx" },
              { id: "src/components/table/use-table.ts", label: "use-table.ts" },
            ],
          },
          {
            id: "src/components/tree",
            label: "tree",
            children: [
              { id: "src/components/tree/index.ts", label: "index.ts" },
              { id: "src/components/tree/tree.test.tsx", label: "tree.test.tsx" },
              { id: "src/components/tree/tree.tsx", label: "tree.tsx" },
            ],
          },
        ],
      },
      { id: "src/index.ts", label: "index.ts" },
      { id: "src/styles.css", label: "styles.css" },
    ],
  },
  { id: "CHANGELOG.md", label: "CHANGELOG.md" },
  { id: "package.json", label: "package.json" },
  { id: "README.md", label: "README.md" },
];

// Stands in for a request to the server.
const loadChildren = (folder: TreeItem) =>
  new Promise<TreeItem[]>((resolve) =>
    setTimeout(
      () =>
        resolve(
          ["table.spec.ts", "timeline.spec.ts", "tree.spec.ts", "virtual-list.spec.ts"].map((name) => ({
            id: `${folder.id}/${name}`,
            label: name,
          })),
        ),
      900,
    ),
  );

export default function TreePlate() {
  const [opened, setOpened] = useState("src/components/tree/tree.tsx");

  return (
    <div className="w-full max-w-80 overflow-hidden rounded-large border border-border bg-surface-1">
      <div className="flex items-center justify-between gap-3 border-b border-border px-3.5 py-2.5">
        <span className="text-sm font-semibold">cennge-ui</span>
        <Badge size="sm">main</Badge>
      </div>
      <Tree
        aria-label="Files in cennge-ui"
        items={files}
        defaultExpandedKeys={["src", "src/components", "src/components/tree"]}
        defaultSelectedKey="src/components/tree/tree.tsx"
        loadChildren={loadChildren}
        onAction={(file) => setOpened(file.id)}
        className="p-1.5"
      />
      <p className="truncate border-t border-border px-3.5 py-2.5 text-xs text-muted" aria-live="polite">
        Opened <span className="font-mono text-foreground">{opened}</span>
      </p>
    </div>
  );
}
