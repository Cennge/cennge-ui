"use client";

import { useState } from "react";
import { Step, Stepper } from "cennge-ui";

const sections = [
  { title: "General", text: "Name, description and topics of ai-niche-scout." },
  { title: "Branches", text: "Protect main: changes arrive through pull requests." },
  { title: "Notifications", text: "Release notes by email to dev@example.com." },
];

export default function SetupSteps() {
  const [step, setStep] = useState(0);

  return (
    <Stepper activeStep={step} onStepClick={setStep} allowNextStepsSelect aria-label="Set up ai-niche-scout" className="w-full">
      {sections.map((section) => (
        <Step key={section.title} title={section.title}>
          <p className="text-muted">{section.text}</p>
        </Step>
      ))}
    </Stepper>
  );
}
