"use client";

import { useState } from "react";
import { Button, Timeline, TimelineItem } from "cennge-ui";

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M3 12V4h8l9 9-8 8-9-9z" strokeLinejoin="round" />
    </svg>
  );
}

export default function TimelinePlate() {
  const [isPromoted, setPromoted] = useState(false);

  return (
    <>
      <div className="flex w-full max-w-46 flex-col gap-4">
        <p id="releases-title" className="text-sm font-semibold">
          cennge-ui releases
        </p>
        <Timeline aria-labelledby="releases-title" size="sm">
          <TimelineItem title="v0.3.1" time="Nov 1" dateTime="2026-11-01" bullet={<TagIcon />}>
            README maps set in New York
          </TimelineItem>
          <TimelineItem title="v0.3.0" time="Oct 31" dateTime="2026-10-31" bullet={<TagIcon />}>
            Charts, ThemeScript, ThemeSwitch
          </TimelineItem>
          <TimelineItem title="v0.2.0" time="Oct 21" dateTime="2026-10-21" bullet={<TagIcon />}>
            Maps on MapLibre GL
          </TimelineItem>
          <TimelineItem title="v0.1.1" time="Oct 20" dateTime="2026-10-20" bullet={<TagIcon />}>
            Date limits take null
          </TimelineItem>
          <TimelineItem title="v0.1.0" time="Oct 19" dateTime="2026-10-19" bullet={<TagIcon />}>
            First release
          </TimelineItem>
        </Timeline>
      </div>

      <div className="flex w-full max-w-46 flex-col gap-4">
        <p className="text-sm font-semibold">payload-cache v1.10.0</p>
        <Timeline aria-label="Deploy of payload-cache v1.10.0" activeIndex={isPromoted ? 3 : 2} color="success" size="sm">
          <TimelineItem title="Build" time="1m 12s" />
          <TimelineItem title="Tests" time="3m 40s" />
          <TimelineItem title="Preview" time={isPromoted ? "Replaced" : "Live"} lineVariant="dashed">
            {isPromoted ? "Promoted to production" : "Waits for someone to promote it"}
          </TimelineItem>
          <TimelineItem title="Production" time={isPromoted ? "Live" : undefined} />
        </Timeline>
        <Button
          size="sm"
          variant="flat"
          color={isPromoted ? "default" : "success"}
          className="self-start"
          onClick={() => setPromoted(!isPromoted)}
        >
          {isPromoted ? "Roll back" : "Promote to production"}
        </Button>
      </div>
    </>
  );
}
