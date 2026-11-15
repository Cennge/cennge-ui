"use client";

import { Button, Separator } from "cennge-ui";

export default function Toolbar() {
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="light">
        Code
      </Button>
      <Button size="sm" variant="light">
        Issues
      </Button>
      <Separator orientation="vertical" className="h-5 self-center" />
      <Button size="sm" variant="light">
        Actions
      </Button>
      <Button size="sm" variant="light">
        Releases
      </Button>
    </div>
  );
}
