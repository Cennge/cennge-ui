"use client";

import { Button, CenngeProvider, Tooltip, toast } from "cennge-ui";

const scripts = [
  { name: "Install", command: "pnpm install" },
  { name: "Typecheck", command: "pnpm typecheck" },
  { name: "Unit tests", command: "pnpm test" },
  { name: "End-to-end", command: "pnpm test:e2e" },
  { name: "Build", command: "pnpm build" },
  { name: "Size", command: "pnpm size" },
];

export default function SharedDelay() {
  // Usually once, around the whole app.
  return (
    <CenngeProvider tooltipDelay={500}>
      <div className="flex flex-wrap gap-1.5">
        {scripts.map((script) => (
          <Tooltip key={script.name} content={<code className="font-mono">{script.command}</code>}>
            <Button
              size="sm"
              variant="flat"
              onClick={async () => {
                await navigator.clipboard.writeText(script.command);
                toast("Copied", { description: script.command });
              }}
            >
              {script.name}
            </Button>
          </Tooltip>
        ))}
      </div>
    </CenngeProvider>
  );
}
