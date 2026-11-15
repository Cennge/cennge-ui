"use client";

import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger, toast } from "cennge-ui";

export default function ScreenshotMenu() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="grid aspect-video w-full max-w-80 place-items-center rounded-large border-2 border-dashed border-border text-sm text-muted select-none">
          screenshot-dark.png
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem shortcut="F2" onAction={() => toast("Renaming screenshot-dark.png")}>
          Rename
        </ContextMenuItem>
        <ContextMenuItem onAction={() => toast("Set as the README image")}>Use in README</ContextMenuItem>
        <ContextMenuItem isDisabled>Compare with previous</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem color="danger" onAction={() => toast.danger("Deleted screenshot-dark.png")}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
