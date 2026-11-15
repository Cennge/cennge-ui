"use client";

import { OtpInput } from "cennge-ui";

export default function RecoveryCode() {
  return (
    <OtpInput
      label="Recovery code"
      description="Letters and digits, from the list you saved"
      length={8}
      groupSize={4}
      allowedCharacters="alphanumeric"
      isMasked
      size="sm"
    />
  );
}
