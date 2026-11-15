"use client";

import { ScrollArea } from "cennge-ui";

const commits = [
  ["881e770", "test(next): look from both sides of the server's time zone on every run"],
  ["4baadf3", "fix(playground): read the repositories' update dates in UTC"],
  ["28a4731", "test(map): set the example maps in New York"],
  ["055d5ef", "fix(kbd): draw the key symbols at the size of the cap"],
  ["f614e25", "fix(dialog): draw the backdrop beside the dialog, not around it"],
  ["9b1a5a4", "feat(charts): Sparkline"],
  ["cdb8e4e", "feat(charts): DonutChart"],
  ["5696189", "feat(charts): LineChart and AreaChart"],
  ["db78740", "feat(charts): BarChart, in a new entry cennge-ui/charts"],
  ["32b28a0", "feat(theme): ThemeScript, useTheme and ThemeSwitch"],
] as const;

export default function Commits() {
  return (
    <ScrollArea aria-label="Commits" fadeEdges className="h-56 w-full max-w-md rounded-large border border-border bg-surface-1">
      <ol className="flex flex-col p-2">
        {commits.map(([sha, message]) => (
          <li key={sha} className="flex items-baseline gap-3 px-2 py-1.5 text-sm">
            <code className="shrink-0 text-xs text-muted">{sha}</code>
            <span className="truncate">{message}</span>
          </li>
        ))}
      </ol>
    </ScrollArea>
  );
}
