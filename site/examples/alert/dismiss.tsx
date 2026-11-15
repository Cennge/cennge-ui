"use client";

import { useState } from "react";
import { Alert, Button } from "cennge-ui";

export default function DismissibleAlert() {
  const [isOpen, setOpen] = useState(true);

  if (!isOpen) {
    return (
      <Button variant="flat" onClick={() => setOpen(true)}>
        Show the alert
      </Button>
    );
  }

  return (
    <Alert
      color="primary"
      title="Two-factor authentication is off"
      description="Turn it on before you publish to npm from this account."
      endContent={
        <Button size="sm" color="primary">
          Turn on
        </Button>
      }
      isClosable
      onClose={() => setOpen(false)}
      className="max-w-xl"
    />
  );
}
