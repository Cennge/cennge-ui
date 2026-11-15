"use client";

import { useState } from "react";
import { Command, CommandItem, toast } from "cennge-ui";

const releases = ["0.3.1", "0.3.0", "0.2.0", "0.1.1", "0.1.0"];

export default function ReleaseSearch() {
  const [query, setQuery] = useState("");

  return (
    <Command
      label="Releases"
      placeholder="Find a cennge-ui release"
      query={query}
      onQueryChange={setQuery}
      emptyContent={`No release of cennge-ui matches “${query}”.`}
      labels={{ results: (count) => (count === 1 ? "1 release" : `${count} releases`) }}
      className="w-full max-w-sm rounded-large border border-border bg-surface-3"
    >
      {releases.map((version) => (
        <CommandItem key={version} onAction={() => toast(`cennge-ui@${version}`)}>
          {`cennge-ui@${version}`}
        </CommandItem>
      ))}
    </Command>
  );
}
