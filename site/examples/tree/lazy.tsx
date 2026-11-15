"use client";

import { useRef, useState } from "react";
import { Tree, type TreeItem } from "cennge-ui";

const branches: Record<string, string[]> = {
  "cennge-ui": ["main", "docs/table"],
  "ai-niche-scout": ["main", "feat/keyword-score"],
  "payload-cache": ["main", "fix/ttl"],
  "spredo-crypto-screener": ["main", "feat/funding-rates"],
  "playwright-msi-scraper": ["main", "feat/retries"],
};

const repositories: TreeItem[] = Object.keys(branches).map((name) => ({ id: name, label: name, hasChildren: true }));

function BranchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="6" cy="5.5" r="2.5" />
      <circle cx="6" cy="18.5" r="2.5" />
      <circle cx="18" cy="7.5" r="2.5" />
      <path d="M6 8v8M18 10c0 4-6 3.5-11 7" strokeLinecap="round" />
    </svg>
  );
}

export default function RepositoryBranches() {
  const [error, setError] = useState<string | null>(null);
  const attempts = useRef(new Map<string, number>());

  // Stands in for a request: payload-cache fails the first time, as a flaky network would.
  const loadChildren = (repository: TreeItem) =>
    new Promise<TreeItem[]>((resolve, reject) => {
      const attempt = (attempts.current.get(repository.id) ?? 0) + 1;
      attempts.current.set(repository.id, attempt);
      setError(null);
      setTimeout(() => {
        if (repository.id === "payload-cache" && attempt === 1) reject(new Error("The request timed out."));
        else
          resolve(
            (branches[repository.id] ?? []).map((branch) => ({
              id: `${repository.id}:${branch}`,
              label: branch,
              icon: <BranchIcon />,
            })),
          );
      }, 800);
    });

  return (
    <div className="flex w-full max-w-80 flex-col gap-2">
      <Tree
        aria-label="Repositories and their branches"
        items={repositories}
        loadChildren={loadChildren}
        onLoadError={(repository, reason) =>
          setError(`${repository.id}: ${reason instanceof Error ? reason.message : "Could not load."} Open it again to retry.`)
        }
        className="rounded-large bg-surface-3 p-1.5"
      />
      <p role="status" className="min-h-10 text-sm text-danger-text">
        {error}
      </p>
    </div>
  );
}
