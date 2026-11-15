"use client";

import { useState } from "react";
import { Button, Form, Select, SelectItem } from "cennge-ui";

export default function DeployForm() {
  const [sent, setSent] = useState<string | null>(null);

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        setSent(String(new FormData(event.currentTarget).get("environment")));
      }}
      className="flex w-full max-w-80 flex-col gap-4"
    >
      <Select name="environment" label="Environment" placeholder="Pick an environment" isRequired>
        <SelectItem value="production">Production</SelectItem>
        <SelectItem value="preview">Preview</SelectItem>
      </Select>
      <Button type="submit" color="primary" className="self-start">
        Deploy payload-cache
      </Button>
      <p aria-live="polite" className="text-sm text-muted">
        {sent ? `Submitted environment=${sent}` : "Nothing submitted yet"}
      </p>
    </Form>
  );
}
