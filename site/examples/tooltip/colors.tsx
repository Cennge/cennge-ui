"use client";

import { Button, Tooltip, toast } from "cennge-ui";

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 7h14M10 7V5h4v2m-7 0 .8 11.2a1 1 0 0 0 1 .8h4.4a1 1 0 0 0 1-.8L17 7" />
    </svg>
  );
}

export default function TooltipColors() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tooltip content="Publishes cennge-ui 0.3.2 to npm" color="primary" placement="bottom" showArrow>
        <Button color="primary" onClick={() => toast.success("Published", { description: "cennge-ui@0.3.2" })}>
          Publish
        </Button>
      </Tooltip>
      <Tooltip content="Deletes fix/select-chevron for good" color="danger" placement="top" align="start" showArrow>
        <Button isIconOnly color="danger" variant="flat" aria-label="Delete branch" onClick={() => toast("Branch deleted")}>
          <TrashIcon />
        </Button>
      </Tooltip>
    </div>
  );
}
