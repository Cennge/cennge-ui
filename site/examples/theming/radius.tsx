"use client";

import { Button, Input } from "cennge-ui";

// The three radii, set on one element for everything inside it.
const tighter = [
  "[--cennge-radius-small:0.125rem]",
  "[--cennge-radius-medium:0.25rem]",
  "[--cennge-radius-large:0.375rem]",
].join(" ");

function InviteForm({ title, className = "" }: { title: string; className?: string }) {
  return (
    <div className={`flex w-full max-w-72 flex-col gap-3 rounded-large border border-border p-4 ${className}`}>
      <p className="text-sm font-semibold">{title}</p>
      <Input label="Invite by email" type="email" defaultValue="dev@example.com" />
      <Button color="primary">Send invite</Button>
    </div>
  );
}

export default function Radius() {
  return (
    <div className="flex w-full flex-wrap gap-4">
      <InviteForm title="As shipped" />
      <InviteForm title="Tighter corners" className={tighter} />
    </div>
  );
}
