"use client";

import { useState } from "react";
import { Alert, Snippet, Step, Stepper, Timeline, TimelineItem } from "cennge-ui";

const releases = [
  { version: "0.3.1", title: "README maps set in New York", date: "2026-11-01", time: "Nov 1" },
  { version: "0.3.0", title: "Charts, ThemeScript and five fixes", date: "2026-10-31", time: "Oct 31" },
  { version: "0.2.0", title: "The map entry, cennge-ui/map", date: "2026-10-21", time: "Oct 21" },
  { version: "0.1.1", title: "Date limits accept null", date: "2026-10-20", time: "Oct 20" },
  { version: "0.1.0", title: "First release", date: "2026-10-19", time: "Oct 19" },
];

export default function UpdateSteps({ step, onStepChange }: { step?: number; onStepChange?: (step: number) => void }) {
  const [ownStep, setOwnStep] = useState(0);
  const activeStep = step ?? ownStep;

  return (
    <Stepper
      aria-label="From install to update"
      activeStep={activeStep}
      onStepClick={(index) => (onStepChange ? onStepChange(index) : setOwnStep(index))}
      allowNextStepsSelect
    >
      <Step title="Install" description="Once per app">
        <div className="flex flex-col gap-3">
          <Snippet>npm install cennge-ui</Snippet>
          <Snippet symbol={false}>{'@import "tailwindcss";\n@import "cennge-ui/styles.css";'}</Snippet>
        </div>
      </Step>
      <Step title="Release" description="A version, a changelog">
        <Timeline size="sm">
          {releases.map((release) => (
            <TimelineItem
              key={release.version}
              title={`${release.version}: ${release.title}`}
              time={release.time}
              dateTime={release.date}
            />
          ))}
        </Timeline>
      </Step>
      <Step title="Update" description="Every app">
        <div className="flex flex-col gap-3">
          <Snippet>npm update cennge-ui</Snippet>
          <Alert
            color="success"
            title="cennge-ui 0.3.1"
            description="With the Kbd, Button and Select fixes from 0.3.0."
          />
        </div>
      </Step>
    </Stepper>
  );
}
