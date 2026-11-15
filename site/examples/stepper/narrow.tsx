"use client";

import { Step, Stepper } from "cennge-ui";

export default function NarrowStepper() {
  return (
    <div className="w-full max-w-xs rounded-large bg-surface-1 p-4">
      <Stepper activeStep={1} size="sm" aria-label="Deploy payload-cache">
        <Step title="Build" />
        <Step title="Preview" />
        <Step title="Production" />
      </Stepper>
    </div>
  );
}
