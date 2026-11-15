"use client";

import { useState } from "react";
import { Button, Form, Input, Radio, RadioGroup } from "cennge-ui";

type Errors = Record<string, string>;

const repositories = ["cennge-ui", "ai-niche-scout", "payload-cache", "spredo-crypto-screener", "playwright-msi-scraper"];

// Stands in for the server. It sees the form only once the browser's own checks have passed.
async function createRepository(data: FormData): Promise<Errors | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const name = String(data.get("name"));
  if (repositories.includes(name)) return { name: `You already have a repository named ${name}` };
}

export default function FormPlate() {
  const [errors, setErrors] = useState<Errors>();
  const [isPending, setPending] = useState(false);
  const [created, setCreated] = useState<string | null>(null);

  return (
    <div className="flex w-full max-w-96 flex-col gap-5">
      <Form
        aria-label="New repository"
        validationErrors={errors}
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setPending(true);
          const found = await createRepository(data);
          setPending(false);
          setErrors(found);
          setCreated(found ? null : String(data.get("name")));
        }}
        className="flex flex-col gap-4"
      >
        <Input
          name="name"
          label="Repository name"
          description="Lowercase letters, digits and dashes"
          pattern="[a-z0-9\-]+"
          isRequired
        />
        <Input name="homepage" label="Homepage" type="url" placeholder="https://" />
        <RadioGroup name="visibility" label="Visibility" orientation="horizontal" isRequired>
          <Radio value="public">Public</Radio>
          <Radio value="private">Private</Radio>
        </RadioGroup>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" color="primary" isLoading={isPending}>
            Create repository
          </Button>
          {created ? <span className="text-sm text-success-text">Created {created}</span> : null}
        </div>
      </Form>
      <div className="flex flex-col gap-1.5">
        <span className="font-code text-[12.5px] text-muted">validationErrors</span>
        <pre className="overflow-x-auto rounded-medium bg-surface-3 px-3 py-2.5 font-code text-[12.5px] leading-normal whitespace-pre-wrap">
          {errors ? JSON.stringify(errors, null, 2) : "undefined"}
        </pre>
      </div>
    </div>
  );
}
