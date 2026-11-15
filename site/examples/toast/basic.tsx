"use client";

import { Button, toast } from "cennge-ui";

export default function ToastBasic() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="flat" onClick={() => toast("Link copied")}>
        Copy link
      </Button>
      <Button color="primary" onClick={() => toast.success("Deployed", { description: "spredo-crypto-screener is live" })}>
        Deploy
      </Button>
    </div>
  );
}
