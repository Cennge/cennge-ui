"use client";

import { Kbd, type KbdProps } from "cennge-ui";

const shortcuts: { action: string; keys: KbdProps["keys"]; key?: string }[] = [
  { action: "Search the docs", keys: "command", key: "K" },
  { action: "Publish a release", keys: ["command", "shift"], key: "P" },
  { action: "Send the form", keys: ["command", "enter"] },
  { action: "Delete a word", keys: ["option", "backspace"] },
];

export default function KbdFix() {
  return (
    <dl className="grid w-full max-w-80 gap-2.5 text-sm">
      {shortcuts.map((shortcut) => (
        <div key={shortcut.action} className="flex items-center justify-between gap-4">
          <dt>{shortcut.action}</dt>
          <dd>
            <Kbd keys={shortcut.keys}>{shortcut.key}</Kbd>
          </dd>
        </div>
      ))}
    </dl>
  );
}
