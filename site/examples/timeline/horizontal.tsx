"use client";

import { Timeline, TimelineItem } from "cennge-ui";

export default function ReleaseFlow() {
  return (
    <Timeline aria-label="How cennge-ui 0.3.1 was released" orientation="horizontal" className="w-full">
      <TimelineItem title="Version PR" time="Oct 31" dateTime="2026-10-31T23:27+02:00">
        Opened by changesets/action
      </TimelineItem>
      <TimelineItem title="Merged" time="Nov 1" dateTime="2026-11-01T10:01+02:00">
        Pull request #4
      </TimelineItem>
      <TimelineItem title="Published" time="Nov 1" dateTime="2026-11-01T10:40+02:00">
        cennge-ui@0.3.1 on npm
      </TimelineItem>
    </Timeline>
  );
}
