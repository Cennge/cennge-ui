"use client";

import { useState } from "react";
import { Badge, Button, toast } from "cennge-ui";

type Status = "draft" | "publishing" | "published" | "discarded";

const release = "cennge-ui@0.3.0";

const changes = ["Charts, in cennge-ui/charts", "Theme switching without a flash", "Kbd draws its key symbols at the size of the key"];

export default function ToastPlate() {
  const [status, setStatus] = useState<Status>("draft");

  function publish() {
    setStatus("publishing");
    // Stands in for the real request.
    const request = new Promise<string>((resolve) => setTimeout(() => resolve("latest"), 1800));
    toast.promise(request, {
      loading: `Publishing ${release}…`,
      success: (tag) => `Published ${release} as ${tag}`,
      error: "Publishing failed",
    });
    request.then(() => setStatus("published"));
  }

  async function copyInstall() {
    const command = `npm install ${release}`;
    try {
      await navigator.clipboard.writeText(command);
      toast("Install command copied", { description: command });
    } catch {
      toast.danger("Could not copy", { description: command });
    }
  }

  function discard() {
    setStatus("discarded");
    toast.warning("Draft discarded", {
      description: release,
      action: { label: "Undo", onClick: () => setStatus("draft") },
    });
  }

  return (
    <div className="w-full max-w-md rounded-large bg-surface-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{release}</p>
          <p className="text-sm text-muted">Release from main</p>
        </div>
        {status === "published" ? (
          <Badge color="success">Published</Badge>
        ) : status === "discarded" ? (
          <Badge color="danger">Discarded</Badge>
        ) : (
          <Badge color="warning">Draft</Badge>
        )}
      </div>
      <ul className="mt-4 grid gap-1.5 text-sm">
        {changes.map((change) => (
          <li key={change} className="flex gap-2">
            <span className="text-muted" aria-hidden="true">
              •
            </span>
            {change}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          color="primary"
          isLoading={status === "publishing"}
          isDisabled={status === "discarded"}
          onClick={publish}
        >
          Publish
        </Button>
        <Button variant="flat" onClick={copyInstall}>
          Copy install command
        </Button>
        <Button
          variant="light"
          color="danger"
          isDisabled={status === "discarded" || status === "publishing"}
          onClick={discard}
        >
          Discard
        </Button>
      </div>
    </div>
  );
}
