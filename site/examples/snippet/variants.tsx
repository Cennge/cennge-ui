"use client";

import { Snippet } from "cennge-ui";

export default function SnippetVariants() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Snippet>pnpm test</Snippet>
        <Snippet variant="faded">pnpm size</Snippet>
        <Snippet variant="bordered" color="primary">
          pnpm build
        </Snippet>
        <Snippet variant="solid" color="primary">
          pnpm release
        </Snippet>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Snippet size="sm" color="success">
          pnpm dev
        </Snippet>
        <Snippet size="lg" radius="full" color="success">
          pnpm test:e2e
        </Snippet>
        <Snippet color="danger" symbol=">">
          rmdir /s /q dist
        </Snippet>
      </div>
    </div>
  );
}
