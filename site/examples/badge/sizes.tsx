"use client";

import { Badge } from "cennge-ui";

export default function BadgeSizes() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge size="sm" color="primary">
          Small
        </Badge>
        <Badge size="md" color="primary">
          Medium
        </Badge>
        <Badge size="lg" color="primary">
          Large
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="bordered" radius="sm">
          v0.3.1
        </Badge>
        <Badge variant="bordered" radius="md">
          MIT
        </Badge>
        <Badge variant="bordered" radius="full">
          TypeScript
        </Badge>
      </div>
      {/* A badge never grows past its parent: long text ends in an ellipsis. */}
      <div className="w-40">
        <Badge variant="faded">fix/select-chevron-inside-an-open-dialog</Badge>
      </div>
    </div>
  );
}
