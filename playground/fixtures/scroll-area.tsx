import { Button, ScrollArea } from "cennge-ui";

const commits = Array.from({ length: 30 }, (_, i) => ({
  sha: (0x6d56f0d + i * 0x1f3a).toString(16).slice(0, 7),
  message: `feat(component-${i + 1}): a commit message long enough to need an ellipsis at the end of the line in a narrow column`,
}));

export default function ScrollAreaFixture() {
  return (
    <>
      <Button>Before</Button>

      <ScrollArea aria-label="Commits" fadeEdges className="h-48 w-full max-w-md rounded-large border border-border bg-surface-2">
        <ul className="flex flex-col p-2">
          {commits.map((commit) => (
            <li key={commit.sha} className="flex gap-3 rounded-small px-2 py-1.5 text-sm">
              <code className="shrink-0 text-muted">{commit.sha}</code>
              <span className="truncate" data-testid="message">
                {commit.message}
              </span>
            </li>
          ))}
        </ul>
      </ScrollArea>

      <ScrollArea aria-label="Branches" orientation="horizontal" type="always" fadeEdges className="w-full max-w-md rounded-large border border-border">
        <div className="flex w-max gap-2 p-3">
          {["main", "feat/slider-marks", "feat/rating", "fix/focus-rings", "feat/scroll-area", "feat/prose", "feat/carousel", "docs/readme"].map(
            (branch) => (
              <span key={branch} className="rounded-full bg-surface-3 px-3 py-1 text-sm whitespace-nowrap">
                {branch}
              </span>
            ),
          )}
        </div>
      </ScrollArea>

      <ScrollArea aria-label="Tags" className="h-48 w-full max-w-md rounded-large border border-border" data-testid="fits">
        <p className="p-3 text-sm">v0.1.0 · v0.0.2 · v0.0.1</p>
      </ScrollArea>

      <ScrollArea aria-label="Build log" orientation="both" type="auto" className="h-40 w-full max-w-md rounded-large border border-border bg-surface-2">
        <pre className="p-3 font-mono text-xs leading-5">
          {Array.from({ length: 24 }, (_, i) => `[${String(i + 1).padStart(2, "0")}] vite v8.3.4 building client environment for production... transforming (${i * 37}) src/components/index.ts`).join("\n")}
        </pre>
      </ScrollArea>

      <Button>After</Button>
    </>
  );
}
