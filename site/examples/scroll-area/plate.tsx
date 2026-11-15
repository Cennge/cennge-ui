"use client";

import { Badge, ScrollArea } from "cennge-ui";

const commits = [
  ["881e770", "test(next): look from both sides of the server's time zone on every run"],
  ["4baadf3", "fix(playground): read the repositories' update dates in UTC"],
  ["20668ec", "docs(changeset): release the README with the New York maps"],
  ["28a4731", "test(map): set the example maps in New York"],
  ["055d5ef", "fix(kbd): draw the key symbols at the size of the cap"],
  ["5252be2", "docs(changeset): describe the dialog backdrop as it ships"],
  ["18bec4b", "docs: the theme switch, charts, and what changed in dialogs"],
  ["3bacd80", "test: skip the focus ring check for a fixture with nothing to focus"],
  ["29dd316", "test(theme): run on React 17 and Testing Library 12 too"],
  ["f614e25", "fix(dialog): draw the backdrop beside the dialog, not around it"],
  ["9b1a5a4", "feat(charts): Sparkline"],
  ["cdb8e4e", "feat(charts): DonutChart"],
  ["5696189", "feat(charts): LineChart and AreaChart"],
  ["db78740", "feat(charts): BarChart, in a new entry cennge-ui/charts"],
  ["65666cf", "test(playground): more time for the full-page axe audits"],
  ["32b28a0", "feat(theme): ThemeScript, useTheme and ThemeSwitch"],
  ["76281e6", "test(select): a tap on an option does not press what is under the list"],
  ["e067d76", "fix(select): the chevron turns only while its own list is open"],
  ["63baf9e", "fix(dialog): popups in a portal scroll inside a modal dialog"],
  ["d948c07", "fix(button): the pointer cursor, and the wait cursor while loading"],
] as const;

const repositories = ["cennge-ui", "ai-niche-scout", "payload-cache", "spredo-crypto-screener", "playwright-msi-scraper"];

export default function ScrollAreaPlate() {
  return (
    <div className="flex w-full flex-col gap-4">
      <ScrollArea aria-label="Commits on main" fadeEdges className="h-64 rounded-large border border-border bg-surface-1">
        <ol className="flex flex-col p-2">
          {commits.map(([sha, message]) => (
            <li key={sha} className="flex items-baseline gap-3 rounded-small px-2 py-1.5 text-sm">
              <code className="shrink-0 text-xs text-muted">{sha}</code>
              <span className="truncate">{message}</span>
            </li>
          ))}
        </ol>
      </ScrollArea>
      <ScrollArea aria-label="Repositories" orientation="horizontal" fadeEdges className="rounded-large border border-border bg-surface-1">
        <div className="flex w-max gap-2 p-3">
          {repositories.map((repository) => (
            <Badge key={repository} color={repository === "cennge-ui" ? "primary" : "default"}>
              {repository}
            </Badge>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
