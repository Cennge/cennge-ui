"use client";

import { useState } from "react";
import { Button, Input, Radio, RadioGroup, Step, Stepper } from "cennge-ui";

function NewRepository() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [isNameMissing, setNameMissing] = useState(false);
  const isLast = step === 2;

  function next() {
    if (step === 3) {
      setName("");
      setStep(0);
      return;
    }
    if (step === 0 && !name.trim()) {
      setNameMissing(true);
      return;
    }
    setStep(step + 1);
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <Stepper
        activeStep={step}
        onStepClick={setStep}
        aria-label="New repository"
        completedContent={
          <p>
            <span className="font-semibold">Cennge/{name.trim()}</span> is created, {visibility}.
          </p>
        }
      >
        <Step title="Name" description="Owner and name" isError={isNameMissing}>
          <Input
            label="Repository name"
            placeholder="payload-cache"
            value={name}
            onValueChange={(value) => {
              setName(value);
              if (value.trim()) setNameMissing(false);
            }}
            isInvalid={isNameMissing}
            errorMessage="Enter a name to go on"
            className="max-w-80"
          />
        </Step>
        <Step title="Visibility" description="Who can see it">
          <RadioGroup label="Visibility" value={visibility} onValueChange={setVisibility} orientation="horizontal">
            <Radio value="public">Public</Radio>
            <Radio value="private">Private</Radio>
          </RadioGroup>
        </Step>
        <Step title="Review">
          <p>
            Create <span className="font-semibold">Cennge/{name.trim()}</span>, {visibility}, with an empty README.
          </p>
        </Step>
      </Stepper>
      <div className="flex gap-2">
        {step < 3 ? (
          <Button variant="flat" isDisabled={step === 0} onClick={() => setStep(step - 1)}>
            Back
          </Button>
        ) : null}
        <Button color="primary" onClick={next}>
          {step === 3 ? "Create another" : isLast ? "Create repository" : "Next"}
        </Button>
      </div>
    </div>
  );
}

export default function StepperPlate() {
  return (
    <div className="flex w-full flex-col gap-8">
      <NewRepository />
      <div className="rounded-large bg-surface-1 p-4">
        <Stepper orientation="vertical" activeStep={1} color="success" size="sm" aria-label="Release payload-cache">
          <Step title="Build" description="pnpm build" />
          <Step title="Test" isLoading>
            <p className="text-xs text-muted">Running the unit and end-to-end tests</p>
          </Step>
          <Step title="Publish" description="npm publish" />
        </Stepper>
      </div>
    </div>
  );
}
