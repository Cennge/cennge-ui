import { useState } from "react";
import { Button, Tree, type TreeItem } from "cennge-ui";

declare global {
  interface Window {
    /** Settles the pending docs/ load from a test. */
    finishDocs?: (ok: boolean) => void;
  }
}

const files: TreeItem[] = [
  { id: ".github", label: ".github", children: [{ id: ".github/workflows/ci.yml", label: "ci.yml" }] },
  {
    id: "src",
    label: "src",
    children: [
      {
        id: "src/components",
        label: "components",
        children: [
          { id: "src/components/button.tsx", label: "button.tsx" },
          { id: "src/components/tree.tsx", label: "tree.tsx" },
        ],
      },
      { id: "src/index.ts", label: "index.ts" },
      { id: "src/styles.css", label: "styles.css" },
    ],
  },
  { id: "docs", label: "docs", hasChildren: true },
  { id: "README.md", label: "README.md" },
  { id: "package.json", label: "package.json" },
];

const loadDocs = () =>
  new Promise<TreeItem[]>((resolve, reject) => {
    window.finishDocs = (ok) =>
      ok
        ? resolve([
            { id: "docs/theming.md", label: "theming.md" },
            { id: "docs/testing.md", label: "testing.md" },
          ])
        : reject(new Error("offline"));
  });

export default function TreeFixture() {
  const [opened, setOpened] = useState("");
  const [errors, setErrors] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <Button size="sm" className="self-start">
        Before
      </Button>
      <Tree
        aria-label="Files"
        items={files}
        defaultExpandedKeys={["src"]}
        loadChildren={loadDocs}
        onLoadError={() => setErrors((count) => count + 1)}
        onAction={(item) => setOpened(item.id)}
        className="w-72 rounded-large bg-surface-2 p-1.5"
      />
      <p>
        opened: <span data-testid="opened">{opened}</span>, load errors: <span data-testid="errors">{errors}</span>
      </p>
      {/* Somewhere for Tab to go: headless Firefox has no browser UI after the last element. */}
      <Button size="sm" className="self-start">
        After
      </Button>
    </div>
  );
}
