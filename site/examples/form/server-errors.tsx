"use client";

import { useState } from "react";
import { Button, Form, Input, Select, SelectItem, toast } from "cennge-ui";

type Errors = Record<string, string>;

// Stands in for your API: it answers with errors by field name, or with none.
async function invite(data: FormData): Promise<{ errors?: Errors }> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (data.get("email") === "dev@example.com") {
    return { errors: { email: "dev@example.com is already a collaborator on payload-cache" } };
  }
  return {};
}

export default function InviteCollaborator() {
  const [errors, setErrors] = useState<Errors>();
  const [isPending, setPending] = useState(false);

  return (
    <Form
      validationErrors={errors}
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setPending(true);
        const result = await invite(data);
        setPending(false);
        setErrors(result.errors);
        if (!result.errors) toast.success("Invitation sent", { description: String(data.get("email")) });
      }}
      className="flex w-full max-w-96 flex-col gap-4"
    >
      <Input name="email" label="Email" type="email" defaultValue="dev@example.com" isRequired />
      <Select name="role" label="Role" defaultValue="write">
        <SelectItem value="read">Read</SelectItem>
        <SelectItem value="triage">Triage</SelectItem>
        <SelectItem value="write">Write</SelectItem>
        <SelectItem value="maintain">Maintain</SelectItem>
      </Select>
      <Button type="submit" color="primary" isLoading={isPending} className="self-start">
        Invite
      </Button>
    </Form>
  );
}
