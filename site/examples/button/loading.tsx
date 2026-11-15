"use client";

import { useState } from "react";
import { Button, toast } from "cennge-ui";

export default function PublishButton() {
  const [isPublishing, setPublishing] = useState(false);

  async function publish() {
    setPublishing(true);
    // Stands in for the real request.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setPublishing(false);
    toast.success("Published", { description: "payload-cache@1.4.0 is on npm" });
  }

  return (
    <Button color="primary" isLoading={isPublishing} onClick={publish}>
      {isPublishing ? "Publishing" : "Publish"}
    </Button>
  );
}
