"use client";

import { Badge, Tree, type TreeItem } from "cennge-ui";

function PackageIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3ZM4 7.5l8 4.5 8-4.5M12 12v9" strokeLinejoin="round" />
    </svg>
  );
}

function pkg(name: string, range: string, optional = false): TreeItem {
  return {
    id: name,
    textValue: name,
    icon: <PackageIcon />,
    label: (
      <span className="flex items-center gap-2">
        {name} {optional ? <Badge size="sm">optional</Badge> : null}{" "}
        <span className="ml-auto font-mono text-xs text-muted">{range}</span>
      </span>
    ),
  };
}

const dependencies: TreeItem[] = [
  {
    id: "dependencies",
    label: "dependencies",
    children: [
      pkg("clsx", "^2.1.1"),
      pkg("radix-ui", "^1.8.1"),
      pkg("tailwind-merge", "^3.7.0"),
      pkg("tailwind-variants", "^3.3.1"),
    ],
  },
  {
    id: "peerDependencies",
    label: "peerDependencies",
    children: [
      pkg("maplibre-gl", "^6.0.0", true),
      pkg("react", "^17 || ^18 || ^19"),
      pkg("react-dom", "^17 || ^18 || ^19"),
      pkg("tailwindcss", "^4.0.0"),
    ],
  },
];

export default function DependencyTree() {
  return (
    <Tree
      aria-label="Dependencies of cennge-ui"
      items={dependencies}
      defaultExpandedKeys={["dependencies", "peerDependencies"]}
      classNames={{ label: "flex-1" }}
      className="w-full max-w-96 rounded-large bg-surface-3 p-1.5"
    />
  );
}
