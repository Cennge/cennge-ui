"use client";

import { useState } from "react";
import { Button, Tree, type TreeItem } from "cennge-ui";

const files: TreeItem[] = [
  {
    id: "e2e",
    label: "e2e",
    children: [
      { id: "e2e/table.spec.ts", label: "table.spec.ts" },
      { id: "e2e/tree.spec.ts", label: "tree.spec.ts" },
    ],
  },
  {
    id: "playground",
    label: "playground",
    children: [
      {
        id: "playground/fixtures",
        label: "fixtures",
        children: [
          { id: "playground/fixtures/table.tsx", label: "table.tsx" },
          { id: "playground/fixtures/tree.tsx", label: "tree.tsx" },
        ],
      },
    ],
  },
  {
    id: "src",
    label: "src",
    children: [
      { id: "src/index.ts", label: "index.ts" },
      { id: "src/styles.css", label: "styles.css" },
    ],
  },
];

/** Every item that has children, at any depth. */
const folderIds = (items: TreeItem[]): string[] =>
  items.flatMap((item) => (item.children ? [item.id, ...folderIds(item.children)] : []));

export default function ControlledTree() {
  const [expanded, setExpanded] = useState<string[]>(["src"]);
  const [selected, setSelected] = useState<string | null>("src/index.ts");

  return (
    <div className="flex w-full max-w-80 flex-col gap-3">
      <div className="flex gap-2">
        <Button size="sm" variant="flat" onClick={() => setExpanded(folderIds(files))}>
          Expand all
        </Button>
        <Button size="sm" variant="flat" onClick={() => setExpanded([])}>
          Collapse all
        </Button>
      </div>
      <Tree
        aria-label="Files"
        items={files}
        expandedKeys={expanded}
        onExpandedChange={setExpanded}
        selectedKey={selected}
        onSelectionChange={setSelected}
        className="rounded-large bg-surface-3 p-1.5"
      />
      <p className="text-sm text-muted">
        Selected: <span className="font-mono text-foreground">{selected ?? "nothing"}</span>
      </p>
    </div>
  );
}
