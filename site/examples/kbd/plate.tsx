"use client";

import { Kbd, type KbdProps } from "cennge-ui";

// One Kbd per shortcut; two caps side by side are two ways to do it.
const groups: { title: string; shortcuts: { action: string; caps: KbdProps[] }[] }[] = [
  {
    title: "Search the docs",
    shortcuts: [
      { action: "Open search", caps: [{ keys: "command", children: "K" }, { keys: "ctrl", children: "K" }] },
      { action: "Next or previous result", caps: [{ keys: "down" }, { keys: "up" }] },
      { action: "Open the result", caps: [{ keys: "enter" }] },
      { action: "Close", caps: [{ keys: "escape" }] },
    ],
  },
  {
    title: "Any page",
    shortcuts: [
      { action: "Next link or field", caps: [{ keys: "tab" }] },
      { action: "Previous link or field", caps: [{ keys: ["shift", "tab"] }] },
    ],
  },
];

export default function KeyboardShortcuts() {
  return (
    <div className="flex w-full max-w-96 flex-col gap-6">
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-2.5">
          <p className="text-sm font-semibold">{group.title}</p>
          <dl className="flex flex-col gap-2.5 text-sm">
            {group.shortcuts.map((shortcut) => (
              <div key={shortcut.action} className="flex items-center justify-between gap-4">
                <dt className="text-muted">{shortcut.action}</dt>
                <dd className="flex gap-1">
                  {shortcut.caps.map((cap, index) => (
                    <Kbd key={index} {...cap} />
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
