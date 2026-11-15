"use client";

import { useState } from "react";
import { Button, Form, Input, Textarea } from "cennge-ui";

export default function PublishRelease() {
  const [published, setPublished] = useState<string | null>(null);

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        setPublished(String(new FormData(event.currentTarget).get("version")));
      }}
      className="flex w-full max-w-96 flex-col gap-4"
    >
      <Input
        name="version"
        label="Version"
        placeholder="1.4.0"
        description="Major, minor and patch"
        pattern="\d+\.\d+\.\d+"
        isRequired
      />
      <Input name="notify" label="Notify" type="email" placeholder="dev@example.com" />
      <Textarea name="notes" label="Release notes" minLength={20} isRequired />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" color="primary">
          Publish payload-cache
        </Button>
        {published ? <span className="text-sm text-success-text">Published {published}</span> : null}
      </div>
    </Form>
  );
}
