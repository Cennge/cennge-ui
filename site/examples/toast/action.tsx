"use client";

import { useState } from "react";
import { Badge, Button, toast } from "cennge-ui";

export default function CloseIssue() {
  const [isOpen, setOpen] = useState(true);

  function close() {
    setOpen(false);
    toast("Issue #12 closed", {
      description: "payload-cache",
      action: { label: "Reopen", onClick: () => setOpen(true) },
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm">Cache misses after a deploy</span>
      <Badge color={isOpen ? "success" : "secondary"}>{isOpen ? "Open" : "Closed"}</Badge>
      <Button size="sm" variant="flat" isDisabled={!isOpen} onClick={close}>
        Close issue
      </Button>
    </div>
  );
}
