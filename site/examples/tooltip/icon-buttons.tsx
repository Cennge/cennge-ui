"use client";

import { Button, Tooltip, toast } from "cennge-ui";

const install = "pnpm add cennge-ui";

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 7 5 5-5 5m8 0h6" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 5h5v5m0-5-8 8M17 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4" />
    </svg>
  );
}

export default function RepositoryActions() {
  return (
    <div className="flex gap-1">
      <Tooltip content="Star cennge-ui">
        <Button isIconOnly variant="flat" aria-label="Star" onClick={() => toast("Starred cennge-ui")}>
          <StarIcon />
        </Button>
      </Tooltip>
      <Tooltip content={`Copy “${install}”`}>
        <Button
          isIconOnly
          variant="flat"
          aria-label="Copy the install command"
          onClick={async () => {
            await navigator.clipboard.writeText(install);
            toast("Copied", { description: install });
          }}
        >
          <TerminalIcon />
        </Button>
      </Tooltip>
      <Tooltip content="github.com/Cennge/cennge-ui">
        <Button asChild isIconOnly variant="flat">
          <a href="https://github.com/Cennge/cennge-ui" aria-label="Open on GitHub">
            <ExternalIcon />
          </a>
        </Button>
      </Tooltip>
    </div>
  );
}
