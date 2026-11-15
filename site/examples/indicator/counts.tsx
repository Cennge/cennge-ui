"use client";

import { Button, Indicator } from "cennge-ui";

export default function IndicatorCounts() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <Indicator content={4} label="4 open pull requests">
        <Button variant="flat">Pull requests</Button>
      </Indicator>
      <Indicator content={12} max={9} color="warning" label="12 failing checks">
        <Button variant="flat">Checks</Button>
      </Indicator>
      <Indicator content="new" color="primary" size="lg" label="New release">
        <Button variant="flat">Releases</Button>
      </Indicator>
      <Indicator color="info" size="sm" label="Unread changes">
        <Button variant="flat">Changelog</Button>
      </Indicator>
    </div>
  );
}
