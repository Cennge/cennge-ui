"use client";

import { useState } from "react";
import { Button, FileUpload } from "cennge-ui";

export default function BugReport() {
  const [sent, setSent] = useState<string[] | null>(null);

  return (
    <form
      className="flex w-full max-w-96 flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        // Send it as it is: fetch(url, { method: "POST", body: data })
        const logs = data.getAll("logs") as File[];
        setSent(logs.filter((file) => file.name).map((file) => file.name));
      }}
    >
      <FileUpload
        label="Logs"
        name="logs"
        accept={[".log", ".txt"]}
        description="From the failed CI run"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" color="primary">
          Send report
        </Button>
        {sent ? <p className="text-sm text-muted">Sent: {sent.length ? sent.join(", ") : "no files"}</p> : null}
      </div>
    </form>
  );
}
