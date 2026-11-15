"use client";

import { Button, Form, Input, toast } from "cennge-ui";

export default function InviteForm() {
  return (
    <Form
      className="flex w-full max-w-80 flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        toast.success("Invitation sent", { description: `${data.get("email")} can now push to ${data.get("repository")}` });
      }}
    >
      <Input name="email" type="email" label="Email" placeholder="dev@example.com" isRequired />
      <Input
        name="repository"
        label="Repository"
        defaultValue="cennge-ui"
        isRequired
        pattern="[a-z0-9\-]+"
        description="Lowercase letters, digits and dashes"
      />
      <Button type="submit" color="primary" className="self-start">
        Invite
      </Button>
    </Form>
  );
}
