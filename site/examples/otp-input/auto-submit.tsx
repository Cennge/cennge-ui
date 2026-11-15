"use client";

import { useState } from "react";
import { OtpInput } from "cennge-ui";

export default function TwoFactorForm() {
  const [submitted, setSubmitted] = useState("");

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
      }}
    >
      <OtpInput label="Authenticator code" name="code" groupSize={3} autoSubmit />
      {submitted ? <p className="font-mono text-[13px] text-muted">submitted: {submitted}</p> : null}
    </form>
  );
}
