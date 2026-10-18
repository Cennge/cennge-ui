import { useState } from "react";
import { Button, toast } from "cennge-ui";

declare global {
  interface Window {
    /** Resolves the promise behind "Promise toast"; called by the e2e test. */
    settleToast?: () => void;
  }
}

export default function ToastFixture() {
  const [log, setLog] = useState<string[]>([]);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => toast.success("Deployed", { description: "v0.2.0 is live", duration: 1500 })}>
          Short toast
        </Button>
        <Button onClick={() => toast("Branch is behind", { duration: Infinity })}>Sticky toast</Button>
        <Button
          onClick={() =>
            toast.warning("Token expires soon", {
              duration: Infinity,
              action: { label: "Renew", onClick: () => setLog((entries) => [...entries, "renew"]) },
            })
          }
        >
          Toast with action
        </Button>
        <Button
          onClick={() => {
            const done = new Promise<void>((resolve) => {
              window.settleToast = resolve;
            });
            toast.promise(done, { loading: "Pushing…", success: "Pushed", error: "Push failed" }, { duration: Infinity });
          }}
        >
          Promise toast
        </Button>
      </div>
      <p>
        log: <span data-testid="log">{log.join(",")}</span>
      </p>
    </>
  );
}
