"use client";

import { Kbd } from "cennge-ui";

export default function KbdShortcuts() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Kbd keys="command">K</Kbd>
        <Kbd keys={["command", "shift"]}>P</Kbd>
        <Kbd keys={["ctrl", "alt"]}>T</Kbd>
        <Kbd keys="option" />
        <Kbd>F5</Kbd>
        <Kbd>PageDown</Kbd>
      </div>
      <p className="text-sm text-muted">
        Press <Kbd keys="escape" size="sm" /> to close the dialog, or <Kbd keys="enter" size="sm" /> to save.
      </p>
    </div>
  );
}
