"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "cennge-ui";

export default function WatchSettings() {
  const [events, setEvents] = useState<string[]>(["releases"]);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">Notify me about cennge-ui</p>
      <ToggleGroup selectionMode="multiple" variant="bordered" color="primary" aria-label="Notify me about cennge-ui" value={events} onValueChange={setEvents}>
        <ToggleGroupItem value="issues">Issues</ToggleGroupItem>
        <ToggleGroupItem value="pulls">Pull requests</ToggleGroupItem>
        <ToggleGroupItem value="releases">Releases</ToggleGroupItem>
      </ToggleGroup>
      <p className="font-mono text-[13px] text-muted">{JSON.stringify(events)}</p>
    </div>
  );
}
