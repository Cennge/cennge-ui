"use client";

import { useState } from "react";
import { PasswordInput, Switch } from "cennge-ui";

export default function ChangePassword() {
  const [isVisible, setVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const isMismatch = confirmation.length > 0 && confirmation !== password;

  return (
    <div className="flex w-full max-w-80 flex-col gap-4">
      <PasswordInput
        label="New password"
        autoComplete="new-password"
        value={password}
        onValueChange={setPassword}
        isVisible={isVisible}
        onVisibilityChange={setVisible}
      />
      <PasswordInput
        label="Repeat it"
        autoComplete="new-password"
        value={confirmation}
        onValueChange={setConfirmation}
        isVisible={isVisible}
        onVisibilityChange={setVisible}
        isInvalid={isMismatch}
        errorMessage="The two passwords differ"
      />
      <Switch size="sm" isSelected={isVisible} onValueChange={setVisible}>
        Show passwords
      </Switch>
    </div>
  );
}
