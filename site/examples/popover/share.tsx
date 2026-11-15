"use client";

import { Button, Input, Popover, PopoverClose, PopoverContent, PopoverTrigger, toast } from "cennge-ui";

const link = "https://github.com/Cennge/cennge-ui";

export default function ShareLink() {
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
