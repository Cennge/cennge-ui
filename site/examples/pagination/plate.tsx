"use client";

import { useState } from "react";
import { Pagination } from "cennge-ui";

/** The 60 latest commits on main of cennge-ui, merges aside. */
const commits: [hash: string, subject: string][] = [
  ["881e770", "test(next): look from both sides of the server's time zone on every run"],
  ["4baadf3", "fix(playground): read the repositories' update dates in UTC"],
  ["c2d6d1b", "chore: release"],
  ["20668ec", "docs(changeset): release the README with the New York maps"],
  ["28a4731", "test(map): set the example maps in New York"],
  ["5b54e06", "chore: release"],
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
  ["170126b", "fix: the pointer cursor on navigation menu triggers and carousel dots"],
  ["d948c07", "fix(button): the pointer cursor, and the wait cursor while loading"],
  ["375162a", "chore: release"],
  ["488fac7", "test(map): read the route's paint only once it is back after a style swap"],
  ["6bbb3ac", "fix(map): a tooltip opened by a tap stays until a tap elsewhere"],
  ["d6f8c27", "feat(map): MapGeoJSON, MapLegend, MapClusterLayer and MapArc"],
  ["0996c7c", "feat(map): the base map in the theme's colours"],
  ["22332aa", "refactor(map): one hook for a component's map layers; MapRoute on it"],
  ["1a7be49", "ci: park the pointer outside headed Firefox's window"],
  ["ad7625e", "ci: Firefox in a window on Xvfb, so the map gets WebGL"],
  ["6baf545", "feat(map): Map, MapMarker, MapPopup, MapControls and MapRoute in cennge-ui/map"],
  ["c28feec", "chore: release"],
  ["4b33465", "feat(dates): minValue and maxValue accept null for no limit"],
  ["7957cbd", "ci(release): use the input names of changesets/action v2"],
  ["7beadc9", "ci: release from GitHub Actions with npm trusted publishing"],
  ["70e4296", "chore: release 0.1.0"],
  ["53688bc", "docs: link the Radix issue for toasts on React 17"],
  ["74a6b94", "test: a Next.js app checks server rendering and hydration"],
  ["1c6f391", "fix(calendar): hydrate cleanly when the server's today is not the user's"],
  ["0bc12fb", "fix(playground): read today after mount, so the demos render on a server"],
  ["be8794b", "ci: unit tests and published types on React 17 and 18"],
  ["7934ccd", "test(toast): mark Radix's React 17 failure as expected"],
  ["9a388fb", "fix(navigation-menu): render on React 17"],
  ["3f24465", "build: one chunk per component, so pages pay only for what they import"],
  ["8f1ca02", "test(e2e): wait for the virtual list to settle, not just for rows to touch"],
  ["3a7a79e", "test(e2e): the row-stacking check waits for the rows to be measured"],
  ["b2d6557", "test(e2e): one axe run per calendar test"],
  ["08dc16f", "fix(virtual-list): Home and End reach the first and last row exactly"],
  ["1f42e02", "fix(navigation-menu): a vertical menu's panel stays on a phone's screen"],
  ["b83fded", "fix(navigation-menu): a mouse click keeps a hover-opened panel open"],
  ["d312f8f", "test(e2e): a focus ring must not be cut off by a clipping parent"],
  ["fe45f95", "fix(playground): no sideways scrolling on a phone"],
  ["5a08615", "fix(toggle-group): the focus ring of bordered items was cut off"],
  ["fbec6d5", "fix(carousel): flat controls instead of raised buttons"],
  ["407c189", "fix(toast): a bigger close button and an error cross the size of the other icons"],
  ["bec696b", "fix(dialog): the focus ring of a field at the bottom of a dialog was cut off"],
  ["2977bf1", "fix(navigation-menu): a panel closed by a click no longer reopens"],
  ["8241d25", "fix(navigation-menu): an open panel kept shrinking to a thin line"],
  ["3708835", "feat(combobox): render only the options in view past 100"],
];

const pageSize = 5;

export default function PaginationPlate() {
  const [page, setPage] = useState(3);
  const total = Math.ceil(commits.length / pageSize);
  const shown = commits.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4 px-1">
        <span className="text-sm font-semibold">Commits on main</span>
        <span className="text-xs text-muted tabular-nums">
          Page {page} of {total}
        </span>
      </div>
      <ol className="divide-y divide-border rounded-large bg-surface-1">
        {shown.map(([hash, subject]) => (
          <li key={hash} className="flex items-baseline gap-3 px-4 py-2.5 text-sm">
            <a href={`https://github.com/Cennge/cennge-ui/commit/${hash}`} className="shrink-0 rounded-small font-code text-xs text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid">
              {hash}
            </a>
            <span className="min-w-0 truncate">{subject}</span>
          </li>
        ))}
      </ol>
      {/* Seven slots and two arrows are wider than a phone: there, one slot on each side fewer. */}
      <Pagination aria-label="Commit pages" total={total} page={page} onPageChange={setPage} className="justify-center max-sm:hidden" />
      <Pagination aria-label="Commit pages" total={total} page={page} onPageChange={setPage} siblings={0} className="justify-center sm:hidden" />
    </div>
  );
}
