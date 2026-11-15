"use client";

import { useState } from "react";
import { Button, toast } from "cennge-ui";

export default function ButtonFix() {
  const [isPublishing, setPublishing] = useState(false);

  async function publish() {
    setPublishing(true);
    // Stands in for the real request.
    await new Promise((resolve) => setTimeout(resolve, 1600));
    setPublishing(false);
    toast.success("Published", { description: "payload-cache@1.4.0 is on npm" });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button color="primary" isLoading={isPublishing} onClick={publish}>
        {isPublishing ? "Publishing" : "Publish 1.4.0"}
      </Button>
      <Button asChild variant="flat" isDisabled>
        <a href="https://github.com/Cennge/payload-cache/releases">Release notes</a>
      </Button>
    </div>
  );
}
