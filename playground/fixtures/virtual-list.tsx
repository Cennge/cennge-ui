import { useRef, useState } from "react";
import { VirtualList, type Virtualizer } from "cennge-ui";

const commits = Array.from({ length: 10_000 }, (_, i) => ({
  sha: (0x100000 + i * 2654435761).toString(16).slice(-7),
  message: `Commit ${i + 1}`,
  // Every seventh commit has a body: rows differ in height.
  body: i % 7 === 0 ? "A longer description that takes a second line under the subject of the commit." : undefined,
}));

export default function VirtualListFixture() {
  const list = useRef<Pick<Virtualizer, "scrollToIndex">>(null);
  const [target, setTarget] = useState("4812");

  return (
    <>
      <button type="button">Before</button>
      <VirtualList
        items={commits}
        getKey={(commit) => commit.sha + commit.message}
        estimateSize={44}
        aria-label="Commits"
        fadeEdges
        listRef={list}
        className="h-80 w-full max-w-lg rounded-large border border-border bg-surface-2"
      >
        {(commit) => (
          <div className="flex flex-col gap-0.5 border-b border-border px-4 py-2.5 text-sm">
            <span className="flex gap-3">
              <code className="text-muted">{commit.sha}</code>
              <span>{commit.message}</span>
            </span>
            {commit.body ? <span className="text-xs text-muted">{commit.body}</span> : null}
          </div>
        )}
      </VirtualList>
      <div className="flex items-end gap-2">
        <label className="flex flex-col gap-1 text-sm">
          Commit number
          <input
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            className="rounded-small border border-border bg-surface-3 px-2 py-1"
          />
        </label>
        <button
          type="button"
          className="rounded-small bg-surface-4 px-3 py-1.5 text-sm"
          onClick={() => list.current?.scrollToIndex(Number(target) - 1, { align: "center" })}
        >
          Jump
        </button>
      </div>
      <button type="button">After</button>
    </>
  );
}
