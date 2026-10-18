import { Timeline, TimelineItem } from "cennge-ui";

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M3 12V4h8l9 9-8 8-9-9z" strokeLinejoin="round" />
    </svg>
  );
}

export default function TimelineFixture() {
  return (
    <>
      <Timeline aria-label="Releases">
        <TimelineItem title="v0.3.0 planned" time="Nov 2026" lineVariant="dashed" color="secondary" />
        <TimelineItem title="Deploy failed" time="Oct 18, 15:10" dateTime="2026-10-18T15:10" color="danger">
          Typecheck job exited with code 2
        </TimelineItem>
        <TimelineItem title="v0.2.0" time="Oct 18" dateTime="2026-10-18" bullet={<TagIcon />}>
          Select, Combobox and MultiSelect
        </TimelineItem>
        <TimelineItem title="v0.1.0" time="Oct 1" dateTime="2026-10-01" bullet={<TagIcon />}>
          First release
        </TimelineItem>
      </Timeline>

      <Timeline aria-label="Order" activeIndex={1} color="success">
        <TimelineItem title="Ordered" time="Mon" />
        <TimelineItem title="Shipped" time="Tue" />
        <TimelineItem title="Delivered" time="Thu" />
      </Timeline>

      <Timeline aria-label="Roadmap" orientation="horizontal" activeIndex={2}>
        <TimelineItem title="Tokens" time="Q1">Theme and dark mode</TimelineItem>
        <TimelineItem title="Overlays" time="Q1">Dialog, Drawer, Popover</TimelineItem>
        <TimelineItem title="Forms" time="Q2">Combobox, NumberInput</TimelineItem>
        <TimelineItem title="Dates" time="Q3">DatePicker</TimelineItem>
        <TimelineItem title="Data" time="Q3">Table</TimelineItem>
        <TimelineItem title="1.0" time="Q4">Stable API</TimelineItem>
      </Timeline>
    </>
  );
}
