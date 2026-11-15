"use client";

import { Button, Form, Input, PasswordInput, toast } from "cennge-ui";

export default function SignUpForm() {
  return (
    <Form
      className="flex w-full max-w-80 flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        toast.success("Account created", { description: String(new FormData(event.currentTarget).get("email")) });
      }}
    >
      <Input label="Email" name="email" type="email" autoComplete="username" placeholder="dev@example.com" isRequired />
      <PasswordInput
        label="Password"
        name="password"
        autoComplete="new-password"
        minLength={12}
        isRequired
        description="At least 12 characters"
      />
      <Button type="submit" color="primary" className="self-start">
        Create account
      </Button>
    </Form>
  );
}
