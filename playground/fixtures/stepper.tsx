import { useState } from "react";
import { Button, Step, Stepper } from "cennge-ui";

export default function StepperFixture() {
  const [step, setStep] = useState(0);

  return (
    <>
      <Stepper
        activeStep={step}
        onStepClick={setStep}
        aria-label="Create repository"
        completedContent={<p>Repository created</p>}
      >
        <Step title="Repository" description="Owner and name">
          <p>Step 1 form</p>
        </Step>
        <Step title="Settings" description="Visibility">
          <p>Step 2 form</p>
        </Step>
        <Step title="Access" description="Collaborators">
          <p>Step 3 form</p>
        </Step>
        <Step title="Review">
          <p>Step 4 form</p>
        </Step>
      </Stepper>
      <div className="flex gap-2">
        <Button onClick={() => setStep((s) => Math.max(0, s - 1))} isDisabled={step === 0}>
          Back
        </Button>
        <Button color="primary" onClick={() => setStep((s) => s + 1)} isDisabled={step >= 4}>
          Next
        </Button>
      </div>

      <Stepper orientation="vertical" activeStep={1} aria-label="Deploy" color="success">
        <Step title="Build" description="pnpm build" />
        <Step title="Test" isLoading>
          <p>Running 95 tests…</p>
        </Step>
        <Step title="Publish" />
      </Stepper>
    </>
  );
}
