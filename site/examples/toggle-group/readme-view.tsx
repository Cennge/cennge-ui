"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "cennge-ui";

const readme = "# cennge-ui\n\nTactile, dark-first React components on Radix UI and Tailwind CSS v4.";

export default function ReadmeView() {
  const [view, setView] = useState<string | null>("preview");

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <ToggleGroup aria-label="README view" size="sm" value={view} onValueChange={setView}>
        <ToggleGroupItem value="preview">Preview</ToggleGroupItem>
        <ToggleGroupItem value="code">Code</ToggleGroupItem>
      </ToggleGroup>
      {view === "code" ? (
        <pre className="rounded-medium bg-surface-3 p-4 font-mono text-[13px] whitespace-pre-wrap">{readme}</pre>
      ) : (
        <div className="rounded-medium bg-surface-3 p-4">
          <p className="text-lg font-bold">cennge-ui</p>
          <p className="mt-1 text-sm text-muted">Tactile, dark-first React components on Radix UI and Tailwind CSS v4.</p>
        </div>
      )}
    </div>
  );
}
