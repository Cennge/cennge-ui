"use client";

import { Button, Popover, PopoverContent, PopoverTrigger, type PopoverContentProps } from "cennge-ui";

const sides: { placement: NonNullable<PopoverContentProps["placement"]>; cell: string }[] = [
  { placement: "top", cell: "col-start-2" },
  { placement: "left", cell: "col-start-1 row-start-2" },
  { placement: "right", cell: "col-start-3 row-start-2" },
  { placement: "bottom", cell: "col-start-2 row-start-3" },
];

export default function PopoverPlacement() {
  return (
    <div className="mx-auto grid w-fit grid-cols-3 gap-2">
      {sides.map(({ placement, cell }) => (
        <Popover key={placement}>
          <PopoverTrigger>
            <Button variant="flat" className={cell}>
              {placement[0]!.toUpperCase() + placement.slice(1)}
            </Button>
          </PopoverTrigger>
          <PopoverContent placement={placement} showArrow aria-label="Last deploy" className="w-48">
            <p className="font-semibold">Last deploy</p>
            <p className="mt-1 text-muted">payload-cache went out from main and passed its checks.</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}
