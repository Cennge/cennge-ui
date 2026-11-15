"use client";

import { useState } from "react";
import { Button, Checkbox, Form } from "cennge-ui";

export default function DeleteRepositoryForm() {
  const [sent, setSent] = useState<string | null>(null);

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        setSent(String(new FormData(event.currentTarget).get("confirm")));
      }}
      className="flex w-full max-w-96 flex-col gap-4"
    >
      <Checkbox name="confirm" isRequired>
        I understand that payload-cache and its issues will be deleted
      </Checkbox>
      <Button type="submit" color="danger" className="self-start">
        Delete payload-cache
      </Button>
      <p aria-live="polite" className="text-sm text-muted">
        {sent === null ? "Nothing submitted yet" : `Submitted confirm=${sent}`}
      </p>
    </Form>
  );
}
