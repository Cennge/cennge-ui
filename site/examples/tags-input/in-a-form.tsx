"use client";

import { useState } from "react";
import { Button, Form, TagsInput } from "cennge-ui";

export default function ReleaseForm() {
  const [sent, setSent] = useState<string[] | null>(null);

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        setSent(new FormData(event.currentTarget).getAll("reviewers").map(String));
      }}
      className="flex w-full max-w-96 flex-col gap-4"
    >
      <TagsInput name="reviewers" label="Reviewers" placeholder="GitHub username" isRequired description="Enter adds a name; Enter in an empty field submits" />
      <Button type="submit" color="primary" className="self-start">
        Request review
      </Button>
      <p aria-live="polite" className="text-sm text-muted">
        {sent ? `Submitted reviewers=${JSON.stringify(sent)}` : "Nothing submitted yet"}
      </p>
    </Form>
  );
}
