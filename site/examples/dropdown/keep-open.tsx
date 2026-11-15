"use client";

import { useState } from "react";
import { Button, Dropdown, DropdownContent, DropdownItem, DropdownLabel, DropdownTrigger } from "cennge-ui";

export default function TextSize() {
  const [size, setSize] = useState(14);

  return (
    <div className="flex w-full flex-wrap items-center gap-4">
      <Dropdown>
        <DropdownTrigger>
          <Button variant="flat">View</Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownLabel>Text size: {size}px</DropdownLabel>
          <DropdownItem keepOpen isDisabled={size >= 20} onAction={() => setSize(size + 1)}>
            Larger
          </DropdownItem>
          <DropdownItem keepOpen isDisabled={size <= 11} onAction={() => setSize(size - 1)}>
            Smaller
          </DropdownItem>
          <DropdownItem onAction={() => setSize(14)}>Reset</DropdownItem>
        </DropdownContent>
      </Dropdown>
      <code className="font-mono text-muted" style={{ fontSize: size }}>
        pnpm add cennge-ui
      </code>
    </div>
  );
}
