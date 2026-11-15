"use client";

import { useState } from "react";
import { Input } from "cennge-ui";

export default function ContactEmail() {
  const [email, setEmail] = useState("");
  const [isTouched, setTouched] = useState(false);
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <Input
      type="email"
      label="Security contact"
      placeholder="dev@example.com"
      description="Reports about payload-cache go here"
      value={email}
      onValueChange={setEmail}
      onBlur={() => setTouched(true)}
      isInvalid={isTouched && !isValid}
      errorMessage="Enter an address like dev@example.com"
      className="w-full max-w-80"
    />
  );
}
