"use client";

import { Button, toast } from "cennge-ui";

// Stands in for the real request: resolves with the version, or fails without a token.
function publish(hasToken: boolean) {
  return new Promise<string>((resolve, reject) =>
    setTimeout(() => (hasToken ? resolve("0.3.1") : reject(new Error("401: no npm token"))), 1500),
  );
}

export default function PublishPromise() {
  function run(hasToken: boolean) {
    toast.promise(publish(hasToken), {
      loading: "Publishing cennge-ui…",
      success: (version) => `Published cennge-ui@${version}`,
      error: (error) => `Publishing failed: ${error instanceof Error ? error.message : "unknown error"}`,
    });
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button color="primary" onClick={() => run(true)}>
        Publish
      </Button>
      <Button variant="flat" onClick={() => run(false)}>
        Publish without a token
      </Button>
    </div>
  );
}
