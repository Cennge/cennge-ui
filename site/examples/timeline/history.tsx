"use client";

import { Timeline, TimelineItem } from "cennge-ui";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="M7 7l10 10M17 7 7 17" strokeLinecap="round" />
    </svg>
  );
}

export default function DeployHistory() {
  return (
    <Timeline aria-label="Deploys of payload-cache" className="w-full max-w-80">
      <TimelineItem title="v1.11.0 planned" time="Next week" color="default" lineVariant="dashed" />
      <TimelineItem title="v1.10.0 deployed" time="Nov 6, 09:12" dateTime="2026-11-06T09:12Z" color="success" bullet={<CheckIcon />}>
        Production, in 84 seconds
      </TimelineItem>
      <TimelineItem title="Deploy failed" time="Nov 5, 17:40" dateTime="2026-11-05T17:40Z" color="danger" bullet={<CrossIcon />}>
        Typecheck exited with code 2
      </TimelineItem>
      <TimelineItem title="v1.9.2 deployed" time="Oct 29, 13:27" dateTime="2026-10-29T13:27Z" color="success" bullet={<CheckIcon />}>
        Production, in 79 seconds
      </TimelineItem>
    </Timeline>
  );
}
