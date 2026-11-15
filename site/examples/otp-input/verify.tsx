"use client";

import { useState } from "react";
import { Button, OtpInput, Spinner } from "cennge-ui";

// Stands in for the request that checks the code on your server.
function check(code: string) {
  return new Promise<boolean>((resolve) => setTimeout(() => resolve(code !== "000000"), 1000));
}

export default function ConfirmEmail() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "wrong" | "confirmed">("idle");
  const [isRestarted, setRestarted] = useState(false);

  if (status === "confirmed") {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-success-text">dev@example.com is confirmed</span>
        <Button
          size="sm"
          variant="flat"
          onClick={() => {
            setCode("");
            setStatus("idle");
            setRestarted(true);
          }}
        >
          Start over
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <OtpInput
        autoFocus={isRestarted}
        label="Confirm your email"
        description="Enter the code we sent to dev@example.com"
        value={code}
        onValueChange={(next) => {
          setCode(next);
          setStatus("idle");
        }}
        onComplete={async (complete) => {
          setStatus("checking");
          setStatus((await check(complete)) ? "confirmed" : "wrong");
        }}
        isReadOnly={status === "checking"}
        isInvalid={status === "wrong"}
        errorMessage="That code is not right"
      />
      {status === "checking" ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Spinner size="sm" /> Checking the code
        </p>
      ) : null}
    </div>
  );
}
