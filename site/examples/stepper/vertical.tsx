"use client";

import { useState } from "react";
import { Button, Step, Stepper } from "cennge-ui";

export default function CheckRun() {
  const [step, setStep] = useState(2);
  const [isRunning, setRunning] = useState(false);

  async function rerun() {
    setRunning(true);
    // Stands in for the real run.
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setRunning(false);
    setStep(3);
  }

  return (
    <Stepper orientation="vertical" activeStep={step} aria-label="CI for spredo-crypto-screener" className="max-w-sm">
      <Step title="Install" description="Dependencies" />
      <Step title="Lint" description="Code style" />
      <Step title="Test" description="Unit tests" isError={step === 2 && !isRunning} isLoading={isRunning}>
        <div className="flex flex-col items-start gap-3">
          <p className="text-muted">{isRunning ? "Running the tests again" : "A test of the spread alert failed."}</p>
          <Button size="sm" variant="flat" isDisabled={isRunning} onClick={rerun}>
            Run again
          </Button>
        </div>
      </Step>
      <Step title="Deploy" description="To production">
        <p className="text-muted">Waiting for a reviewer to approve.</p>
      </Step>
    </Stepper>
  );
}
