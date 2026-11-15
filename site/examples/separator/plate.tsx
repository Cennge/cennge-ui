"use client";

import { Button, Input, Separator } from "cennge-ui";

export default function SeparatorPlate() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-large border border-border p-5">
        <Button variant="faded" fullWidth>
          Continue with GitHub
        </Button>
        <Separator>or</Separator>
        <Input label="Email" type="email" placeholder="dev@example.com" />
        <Button color="primary" fullWidth>
          Email me a sign-in link
        </Button>
      </div>
      <div className="flex h-5 items-center gap-3 text-sm text-muted">
        <span className="font-medium text-foreground">cennge-ui</span>
        <Separator orientation="vertical" />
        <span>MIT</span>
        <Separator orientation="vertical" />
        <span>v0.3.1</span>
      </div>
    </div>
  );
}
