"use client";

import { useState } from "react";
import { Button, Radio, RadioGroup, Step, Stepper, Textarea } from "cennge-ui";

export default function ReleaseWizard() {
  const [step, setStep] = useState(0);
  const [bump, setBump] = useState("patch");
  const [notes, setNotes] = useState("");

  function forward() {
    if (step === 3) setNotes("");
    setStep(step === 3 ? 0 : step + 1);
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <Stepper
        activeStep={step}
        onStepClick={setStep}
        aria-label="New payload-cache release"
        completedContent={<p>payload-cache is on its way to npm with a {bump} release.</p>}
      >
        <Step title="Version" description="patch, minor or major">
          <RadioGroup label="Version" value={bump} onValueChange={setBump} orientation="horizontal">
            <Radio value="patch">Patch</Radio>
            <Radio value="minor">Minor</Radio>
            <Radio value="major">Major</Radio>
          </RadioGroup>
        </Step>
        <Step title="Notes" description="For the changelog">
          <Textarea label="What changed" placeholder="One line per change" value={notes} onValueChange={setNotes} className="max-w-96" />
        </Step>
        <Step title="Publish">
          <p>A {bump} release of payload-cache goes to npm.</p>
        </Step>
      </Stepper>
      <div className="flex gap-2">
        {step < 3 ? (
          <Button variant="flat" isDisabled={step === 0} onClick={() => setStep(step - 1)}>
            Back
          </Button>
        ) : null}
        <Button color="primary" onClick={forward}>
          {step === 3 ? "Start again" : step === 2 ? "Publish" : "Next"}
        </Button>
      </div>
    </div>
  );
}
