"use client";

import { Button } from "cennge-ui";

export default function ButtonSizes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button radius="full" variant="flat" color="primary">
        Full radius
      </Button>
    </div>
  );
}
