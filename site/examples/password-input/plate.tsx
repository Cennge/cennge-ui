"use client";

import { useState } from "react";
import { Button, Input, PasswordInput, toast } from "cennge-ui";

export default function PasswordInputPlate() {
  const [newPassword, setNewPassword] = useState("hunter2");
  const missing = 12 - newPassword.length;

  return (
    <div className="flex w-full max-w-md flex-col gap-7">
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          toast.success("Signed in", { description: String(new FormData(event.currentTarget).get("email")) });
        }}
      >
        <Input label="Email" name="email" type="email" autoComplete="username" defaultValue="dev@example.com" />
        <PasswordInput label="Password" name="password" defaultValue="correct horse battery" />
        <Button type="submit" color="primary" className="self-start">
          Sign in
        </Button>
      </form>
      <PasswordInput
        label="New password"
        autoComplete="new-password"
        variant="bordered"
        value={newPassword}
        onValueChange={setNewPassword}
        description="At least 12 characters"
        isInvalid={newPassword.length > 0 && missing > 0}
        errorMessage={`${missing} more ${missing === 1 ? "character" : "characters"}, at least 12 in all`}
        className="border-t border-border pt-7"
      />
    </div>
  );
}
