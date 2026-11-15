"use client";

import { Timeline, TimelineItem } from "cennge-ui";

export default function IssueProgress() {
  return (
    <Timeline aria-label="Progress of the payload-cache issue" activeIndex={2} className="w-full max-w-80">
      <TimelineItem title="Reported" time="Nov 2" dateTime="2026-11-02">
        Cached pages keep their old TTL after a config change
      </TimelineItem>
      <TimelineItem title="Reproduced" time="Nov 3" dateTime="2026-11-03">
        A failing test on the fix/ttl branch
      </TimelineItem>
      <TimelineItem title="Fix merged" time="Nov 5" dateTime="2026-11-05" lineVariant="dashed">
        Waiting for the next release
      </TimelineItem>
      <TimelineItem title="Released" />
    </Timeline>
  );
}
