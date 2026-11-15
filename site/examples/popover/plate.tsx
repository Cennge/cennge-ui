"use client";

import { useState } from "react";
import { Button, Input, Popover, PopoverClose, PopoverContent, PopoverTrigger, Radio, RadioGroup, toast } from "cennge-ui";

type Level = "participating" | "all" | "ignore";

const levels: { value: Level; label: string; description: string }[] = [
  { value: "participating", label: "Participating", description: "Only threads you take part in or are mentioned in." },
  { value: "all", label: "All activity", description: "Every issue, pull request and release." },
  { value: "ignore", label: "Ignore", description: "Nothing, not even mentions." },
];

const link = "https://github.com/Cennge/cennge-ui";

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 9.5a6 6 0 0 1 12 0c0 4.5 2 6 2 6H4s2-1.5 2-6M10 19.5a2.2 2.2 0 0 0 4 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Notifications() {
  const [level, setLevel] = useState<Level>("participating");

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="flat" startContent={<BellIcon />} endContent={<ChevronIcon />}>
          <span className="sr-only">Notifications: </span>
          {levels.find((option) => option.value === level)!.label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" aria-label="Notifications" className="w-80">
        <RadioGroup label="Notify me about" value={level} onValueChange={(value) => setLevel(value as Level)}>
          {levels.map((option) => (
            <Radio key={option.value} value={option.value} description={option.description}>
              {option.label}
            </Radio>
          ))}
        </RadioGroup>
      </PopoverContent>
    </Popover>
  );
}

function Share() {
  return (
    <Popover>
      <PopoverTrigger>
        <Button color="primary">Share</Button>
      </PopoverTrigger>
      <PopoverContent showArrow aria-label="Share cennge-ui" className="flex w-80 flex-col gap-3">
        <Input label="Link" defaultValue={link} readOnly />
        <PopoverClose>
          <Button
            color="primary"
            onClick={async () => {
              await navigator.clipboard.writeText(link);
              toast("Link copied");
            }}
          >
            Copy link
          </Button>
        </PopoverClose>
      </PopoverContent>
    </Popover>
  );
}

export default function PopoverPlate() {
  return (
    <div className="flex w-full max-w-lg flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-large bg-surface-3 px-5 py-4">
      <div className="min-w-0">
        <p className="font-semibold">
          Cennge <span className="font-normal text-muted">/</span> cennge-ui
        </p>
        <p className="mt-0.5 text-sm text-muted">React UI library</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Notifications />
        <Share />
      </div>
    </div>
  );
}
