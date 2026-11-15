"use client";

import { useActionState, useEffect } from "react";
import { Button, Form, Input, Select, SelectItem, toast } from "cennge-ui";

interface Release {
  repository: string;
  version: string;
}

interface PublishState {
  /** What was sent, so the fields show it again after React resets the form. */
  values: Release;
  errors?: Record<string, string>;
  published?: string;
}

// The latest version of each package on npm; playwright-msi-scraper is not published.
const latest: Record<string, string> = {
  "cennge-ui": "0.3.1",
  "payload-cache": "1.4.0",
  "ai-niche-scout": "0.9.2",
};

function isNewer(version: string, than: string) {
  const a = version.split(".").map(Number);
  const b = than.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i]! > b[i]!;
  return false;
}

// Stands in for a server action: it checks the release and answers with errors by field name.
async function publish(_previous: PublishState, data: FormData): Promise<PublishState> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const repository = String(data.get("repository"));
  const version = String(data.get("version"));
  const values = { repository, version };

  const current = latest[repository];
  if (!current) {
    return { values, errors: { repository: `${repository} is not published to npm` } };
  }
  if (!isNewer(version, current)) {
    return { values, errors: { version: `${repository} is already at ${current}` } };
  }
  latest[repository] = version;
  return { values, published: `${repository}@${version}` };
}

export default function PublishForm() {
  const [state, action, isPending] = useActionState(publish, {
    values: { repository: "payload-cache", version: "1.4.0" },
  });

  useEffect(() => {
    if (state.published) toast.success(`Published ${state.published}`);
  }, [state]);

  return (
    <Form
      aria-label="Publish"
      action={action}
      validationErrors={state.errors}
      className="flex w-full max-w-96 flex-col gap-4"
    >
      <Select
        key={state.values.repository}
        name="repository"
        label="Repository"
        defaultValue={state.values.repository}
        isRequired
      >
        <SelectItem value="cennge-ui">cennge-ui</SelectItem>
        <SelectItem value="payload-cache">payload-cache</SelectItem>
        <SelectItem value="ai-niche-scout">ai-niche-scout</SelectItem>
        <SelectItem value="playwright-msi-scraper">playwright-msi-scraper</SelectItem>
      </Select>
      <Input
        key={state.values.version}
        name="version"
        label="Version"
        defaultValue={state.values.version}
        isRequired
        pattern="\d+\.\d+\.\d+"
        description="major.minor.patch"
      />
      <Button type="submit" color="primary" isLoading={isPending} className="self-start">
        Publish
      </Button>
    </Form>
  );
}
