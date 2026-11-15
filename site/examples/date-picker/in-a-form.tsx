"use client";

import { useState } from "react";
import { Button, DatePicker, Form } from "cennge-ui";

export default function Milestone() {
  const [due, setDue] = useState<string | null>(null);

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        setDue(String(new FormData(event.currentTarget).get("due")));
      }}
      className="flex w-full max-w-64 flex-col gap-4"
    >
      <DatePicker name="due" label="Milestone due" isRequired />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" color="primary">
          Save
        </Button>
        {due ? <code className="font-code text-sm text-muted">due={due}</code> : null}
      </div>
    </Form>
  );
}
