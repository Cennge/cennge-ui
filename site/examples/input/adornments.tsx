"use client";

import { Input } from "cennge-ui";

export default function PreviewAddress() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Input
        label="Repository"
        defaultValue="cennge-ui"
        startContent={<span className="text-sm text-muted select-none">github.com/Cennge/</span>}
      />
      <Input
        label="Preview address"
        defaultValue="payload-cache"
        startContent={<span className="text-sm text-muted select-none">https://</span>}
        endContent={<span className="text-sm text-muted select-none">.example.com</span>}
      />
    </div>
  );
}
