"use client";

import { ToggleGroup, ToggleGroupItem } from "cennge-ui";

export default function DeployTarget() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <p className="text-sm font-medium">Deploy payload-cache to</p>
      <ToggleGroup aria-label="Deploy payload-cache to" color="primary" size="lg" fullWidth defaultValue="preview">
        <ToggleGroupItem value="preview">Preview</ToggleGroupItem>
        <ToggleGroupItem value="staging">Staging</ToggleGroupItem>
        <ToggleGroupItem value="production">Production</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
