"use client";

import { Button, type CenngeVariant } from "cennge-ui";

const variants: CenngeVariant[] = ["solid", "shadow", "bordered", "flat", "faded", "light", "ghost"];

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ButtonPlate() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        {variants.map((variant) => (
          <Button key={variant} color="primary" variant={variant}>
            {variant[0]!.toUpperCase() + variant.slice(1)}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button color="primary" startContent={<DownloadIcon />}>
          Install cennge-ui
        </Button>
        <Button color="primary" isLoading>
          Publishing
        </Button>
        <Button isIconOnly variant="flat" aria-label="Download">
          <DownloadIcon />
        </Button>
        <Button isDisabled>Archived</Button>
      </div>
    </div>
  );
}
