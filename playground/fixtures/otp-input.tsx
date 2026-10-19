import { useState } from "react";
import { Button, Input, OtpInput } from "cennge-ui";

export default function OtpInputFixture() {
  const [completed, setCompleted] = useState("");
  const [submitted, setSubmitted] = useState("");

  return (
    <>
      <Input label="Email" defaultValue="dev@example.com" />
      <OtpInput
        label="Verification code"
        description="6 digits from your authenticator app"
        groupSize={3}
        onComplete={setCompleted}
      />
      <p>
        completed: <span data-testid="completed">{completed}</span>
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(String(new FormData(event.currentTarget).get("code")));
        }}
      >
        <OtpInput label="Recovery code" name="code" length={8} allowedCharacters="alphanumeric" autoSubmit size="sm" />
      </form>
      <p>
        submitted: <span data-testid="submitted">{submitted}</span>
      </p>

      <OtpInput label="Expired code" defaultValue="123456" isInvalid errorMessage="This code has expired" variant="bordered" />
      <Button>After</Button>
    </>
  );
}
