"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Button, Kbd, Textarea, Tooltip } from "cennge-ui";

interface Tool {
  name: string;
  /** Markdown put before and after the selection. */
  wrap: [string, string];
  /** The letter of the Ctrl / Command shortcut. */
  key?: string;
  icon: ReactNode;
}

const icon = (path: ReactNode) => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {path}
  </svg>
);

const tools: Tool[] = [
  { name: "Bold", wrap: ["**", "**"], key: "B", icon: icon(<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zm0 7h7a3.5 3.5 0 0 1 0 7H7z" />) },
  { name: "Italic", wrap: ["_", "_"], key: "I", icon: icon(<path d="M14 5h-4m4 14h-4m3-14-2 14" />) },
  { name: "Code", wrap: ["`", "`"], key: "E", icon: icon(<path d="m9 8-4 4 4 4m6-8 4 4-4 4" />) },
  { name: "Link", wrap: ["[", "](https://)"], key: "K", icon: icon(<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />) },
  { name: "Quote", wrap: ["> ", ""], icon: icon(<path d="M6 7h4v5H6zm0 5c0 3 1 4 3 5m5-10h4v5h-4zm0 5c0 3 1 4 3 5" />) },
  { name: "Bulleted list", wrap: ["- ", ""], icon: icon(<path d="M9 7h11M9 12h11M9 17h11M4.5 7h.01M4.5 12h.01M4.5 17h.01" />) },
];

export default function TooltipPlate() {
  const [notes, setNotes] = useState("The playground reads the repositories' update dates in UTC.\n\nThe Next.js check looks from both sides of the server's time zone.");
  const [isMac, setMac] = useState(false);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);

  function apply({ wrap: [before, after] }: Tool) {
    const textarea = field.current;
    if (!textarea) return;
    const { selectionStart: start, selectionEnd: end } = textarea;
    setNotes(notes.slice(0, start) + before + notes.slice(start, end) + after + notes.slice(end));
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!(isMac ? event.metaKey : event.ctrlKey)) return;
    const tool = tools.find((candidate) => candidate.key?.toLowerCase() === event.key.toLowerCase());
    if (!tool) return;
    event.preventDefault();
    apply(tool);
  }

  return (
    <div className="w-full max-w-lg rounded-large bg-surface-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border py-2 pr-2 pl-5">
        <p id="release-notes" className="font-medium">
          Release notes
        </p>
        <div role="group" aria-label="Formatting" className="flex flex-wrap gap-0.5">
          {tools.map((tool) => (
            <Tooltip
              key={tool.name}
              content={
                tool.key ? (
                  <span className="flex items-center gap-2">
                    {tool.name}
                    <Kbd size="sm" keys={isMac ? "command" : "ctrl"}>
                      {tool.key}
                    </Kbd>
                  </span>
                ) : (
                  tool.name
                )
              }
            >
              <Button isIconOnly size="sm" variant="light" aria-label={tool.name} onClick={() => apply(tool)}>
                {tool.icon}
              </Button>
            </Tooltip>
          ))}
        </div>
      </div>
      <div className="p-3">
        <Textarea
          ref={field}
          aria-labelledby="release-notes"
          value={notes}
          onValueChange={setNotes}
          onKeyDown={onKeyDown}
          minRows={4}
          variant="flat"
        />
      </div>
    </div>
  );
}
