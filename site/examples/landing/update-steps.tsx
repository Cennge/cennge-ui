"use client";

import { useState } from "react";
import { Alert, Snippet, Step, Stepper, Timeline, TimelineItem } from "cennge-ui";
import changelog from "@/generated/releases.json";

// The same text on the server and in every time zone.
const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

// The five latest releases, from the library's CHANGELOG.md at build time.
const releases = changelog.slice(0, 5).map((release) => ({
  version: release.version,
  title: release.title,
  date: release.date ?? undefined,
  time: release.date ? day.format(new Date(release.date)) : undefined,
}));
const latest = changelog[0]!;

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
          <Alert color="success" title={`cennge-ui ${latest.version}`} description={`${latest.title}, in every app at once.`} />
        </div>
      </Step>
    </Stepper>
  );
}
