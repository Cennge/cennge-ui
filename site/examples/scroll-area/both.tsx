"use client";

import { ScrollArea } from "cennge-ui";

const log = `881e770d9d4fb09e61eae8ce6069b29b654aa65f  2026-11-01  test(next): look from both sides of the server's time zone on every run
4baadf3249a748daa07dbdedeb1f05da99e91eee  2026-11-01  fix(playground): read the repositories' update dates in UTC
c2d6d1bf9c74ae87b8fbcf76431c832756c3d3fb  2026-10-31  chore: release
20668ec40bb6cad661b45a49c1b610174fc0a207  2026-10-31  docs(changeset): release the README with the New York maps
28a47314cc0a7a3d4bb833b58c60af625be23a26  2026-10-31  test(map): set the example maps in New York
5b54e0607e0462cd8a45f372a8ec85f535d22ae9  2026-10-31  chore: release
055d5ef8c1f6617d6d81eb04e8816f79b509cfde  2026-10-31  fix(kbd): draw the key symbols at the size of the cap
29dd316ec890cb1d7532b19148a99d4f94a95569  2026-10-31  test(theme): run on React 17 and Testing Library 12 too
f614e2513f4b8ec77d3ef7cba02188ce0c0f9c96  2026-10-31  fix(dialog): draw the backdrop beside the dialog, not around it`;

export default function GitLog() {
  return (
    <ScrollArea aria-label="git log" orientation="both" type="auto" className="h-48 w-full rounded-large border border-border bg-surface-1">
      <pre className="p-4 font-mono text-xs leading-6">{log}</pre>
    </ScrollArea>
  );
}
