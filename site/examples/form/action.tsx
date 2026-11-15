"use client";

import { useActionState } from "react";
import { Button, Form, Input } from "cennge-ui";

interface RenameState {
  name: string;
  error?: string;
  renamed?: boolean;
}

// In a Next.js app this is a server action, in a file that starts with "use server".
async function rename(_previous: RenameState, data: FormData): Promise<RenameState> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const name = String(data.get("name"));
  if (name === "ai-niche-scout") return { name, error: "A repository with this name already exists" };
  return { name, renamed: true };
}

export default function RenameRepository() {
  const [state, action, isPending] = useActionState(rename, { name: "ai-niche-scout" });

  return (
    <Form
      action={action}
      validationErrors={state.error ? { name: state.error } : undefined}
      className="flex w-full max-w-96 flex-col gap-4"
    >
      {/* React empties the form after an action; the key and defaultValue put the typed name back. */}
      <Input key={state.name} name="name" label="Repository name" defaultValue={state.name} isRequired />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" isLoading={isPending}>
          Rename
        </Button>
        {state.renamed ? <span className="text-sm text-success-text">Renamed to {state.name}</span> : null}
      </div>
    </Form>
  );
}
