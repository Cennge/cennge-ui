"use client";

import { useState } from "react";
import { Button, Form, Radio, RadioGroup } from "cennge-ui";

export default function ChangesetForm() {
  const [sent, setSent] = useState<string | null>(null);

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        setSent(String(new FormData(event.currentTarget).get("section")));
      }}
      className="flex flex-col gap-4"
    >
      <RadioGroup name="section" label="Changelog section" orientation="horizontal" isRequired>
        <Radio value="added">Added</Radio>
        <Radio value="changed">Changed</Radio>
        <Radio value="fixed">Fixed</Radio>
      </RadioGroup>
      <Button type="submit" color="primary" className="self-start">
        Add changeset
      </Button>
      <p aria-live="polite" className="text-sm text-muted">
        {sent === null ? "Nothing submitted yet" : `Submitted section=${sent}`}
      </p>
    </Form>
  );
}
