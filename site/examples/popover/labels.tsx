"use client";

import { useState, type FormEvent } from "react";
import { Badge, Button, Checkbox, Popover, PopoverContent, PopoverTrigger } from "cennge-ui";

const allLabels = ["bug", "documentation", "enhancement", "good first issue", "help wanted"];

export default function EditLabels() {
  const [isOpen, setOpen] = useState(false);
  const [labels, setLabels] = useState(["bug"]);
  const [draft, setDraft] = useState(labels);

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLabels(draft);
    setOpen(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium">#52 Cached results outlive a model update</span>
      {labels.map((label) => (
        <Badge key={label} size="sm" variant="flat">
          {label}
        </Badge>
      ))}
      <Popover
        isOpen={isOpen}
        onOpenChange={(next) => {
          if (next) setDraft(labels);
          setOpen(next);
        }}
      >
        <PopoverTrigger>
          <Button size="sm" variant="light">
            Edit labels
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" aria-labelledby="labels-title" className="w-64">
          <form onSubmit={apply} className="flex flex-col gap-3">
            <p id="labels-title" className="font-semibold">
              Labels
            </p>
            {allLabels.map((label) => (
              <Checkbox
                key={label}
                isSelected={draft.includes(label)}
                onValueChange={(isSelected) => setDraft(isSelected ? [...draft, label] : draft.filter((item) => item !== label))}
              >
                {label}
              </Checkbox>
            ))}
            <Button type="submit" size="sm" color="primary" className="mt-1 self-end">
              Apply
            </Button>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}
