"use client";

import { Button, toast } from "cennge-ui";

export default function ToastColors() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="flat" onClick={() => toast("Draft saved")}>
        Default
      </Button>
      <Button
        variant="flat"
        color="success"
        onClick={() => toast.success("Published", { description: "cennge-ui@0.3.1 is on npm" })}
      >
        Success
      </Button>
      <Button
        variant="flat"
        color="info"
        onClick={() => toast.info("New version", { description: "Reload to get cennge-ui 0.3.1" })}
      >
        Info
      </Button>
      <Button
        variant="flat"
        color="warning"
        onClick={() => toast.warning("Token expires soon", { description: "The npm token used by CI" })}
      >
        Warning
      </Button>
      <Button
        variant="flat"
        color="danger"
        onClick={() => toast.danger("Build failed", { description: "ai-niche-scout · main" })}
      >
        Danger
      </Button>
    </div>
  );
}
