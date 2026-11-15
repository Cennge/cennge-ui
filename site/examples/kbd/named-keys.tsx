"use client";

import { Kbd, type KbdKey } from "cennge-ui";

const keys: KbdKey[] = [
  "command",
  "shift",
  "option",
  "ctrl",
  "alt",
  "enter",
  "escape",
  "tab",
  "backspace",
  "delete",
  "space",
  "up",
  "down",
  "left",
  "right",
];

export default function NamedKeys() {
  return (
    <dl className="grid w-full grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-x-8 gap-y-3">
      {keys.map((key) => (
        <div key={key} className="flex items-center justify-between gap-2">
          <dt className="font-mono text-[13px] text-muted">{key}</dt>
          <dd>
            <Kbd keys={key} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
