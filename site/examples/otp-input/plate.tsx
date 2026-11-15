"use client";

import { useState } from "react";
import { OtpInput } from "cennge-ui";

export default function OtpInputPlate() {
  const [entered, setEntered] = useState<string | null>(null);

  return (
    <div className="flex w-full max-w-md flex-col gap-7">
      <div className="flex flex-col gap-2">
        <OtpInput
          label="Verification code"
          description="6 digits, sent to dev@example.com"
          groupSize={3}
          onValueChange={() => setEntered(null)}
          onComplete={setEntered}
        />
        <p className="text-sm text-muted" aria-live="polite">
          {entered ? (
            <>
              onComplete: <span className="font-mono text-foreground">{entered}</span>
            </>
          ) : null}
        </p>
      </div>
      <OtpInput
        label="Code from yesterday"
        defaultValue="481516"
        groupSize={3}
        variant="bordered"
        isInvalid
        errorMessage="This code has expired; ask for a new one"
        className="border-t border-border pt-7"
      />
    </div>
  );
}
