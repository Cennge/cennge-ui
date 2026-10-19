import { useState } from "react";
import { Button, Input, PasswordInput } from "cennge-ui";

export default function PasswordInputFixture() {
  const [submitted, setSubmitted] = useState("");

  return (
    <>
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(String(new FormData(event.currentTarget).get("password")));
        }}
      >
        <Input label="Email" name="email" type="email" autoComplete="username" defaultValue="dev@example.com" />
        <PasswordInput label="Password" name="password" />
        <Button type="submit" className="self-start">
          Sign in
        </Button>
      </form>
      <p>
        submitted: <span data-testid="submitted">{submitted}</span>
      </p>

      <PasswordInput
        label="New password"
        autoComplete="new-password"
        description="At least 12 characters"
        variant="bordered"
      />
      <PasswordInput label="Disabled" isDisabled defaultValue="locked" />
    </>
  );
}
