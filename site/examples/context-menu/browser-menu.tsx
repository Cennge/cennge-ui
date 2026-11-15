"use client";

import { useEffect, useRef, useState } from "react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, toast } from "cennge-ui";

const commit = { hash: "4baadf3", message: "fix(playground): read the repositories' update dates in UTC" };

async function copyHash() {
  try {
    await navigator.clipboard.writeText(commit.hash);
    toast.success(`Copied ${commit.hash}`);
  } catch {
    toast.danger("Could not copy", { description: commit.hash });
  }
}

export default function CommitRow() {
  const message = useRef<HTMLParagraphElement>(null);
  const [hasSelection, setHasSelection] = useState(false);

  // Text selected in the message: right click opens the browser's menu, with Copy and Search.
  useEffect(() => {
    const update = () => {
      const selection = document.getSelection();
      setHasSelection(Boolean(selection && !selection.isCollapsed && message.current?.contains(selection.anchorNode)));
    };
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, []);

  return (
    <ContextMenu>
      <ContextMenuTrigger isDisabled={hasSelection}>
        <div className="flex w-full max-w-md items-baseline gap-3 rounded-medium bg-surface-3 px-4 py-3 text-sm">
          <code className="shrink-0 font-mono text-primary-text">{commit.hash}</code>
          <p ref={message} className="min-w-0">
            {commit.message}
          </p>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onAction={() => toast(`Checked out ${commit.hash}`)}>Check out</ContextMenuItem>
        <ContextMenuItem onAction={() => toast(`Reverting ${commit.hash}`)}>Revert</ContextMenuItem>
        <ContextMenuItem onAction={copyHash}>Copy hash</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
