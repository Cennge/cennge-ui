"use client";

import { useState } from "react";
import { Textarea } from "cennge-ui";

const notes = [
  "NumberInput: hold − or + to keep stepping.",
  "OtpInput: a pasted code with a dash fills every slot.",
  "PasswordInput: a hint while Caps Lock is on.",
].join("\n");

export default function TextareaPlate() {
  const [releaseNotes, setReleaseNotes] = useState(notes);
  const [message, setMessage] = useState(
    "Invalidate the cached pages of a collection when one of its drafts is published\n\nThe cache key now includes the draft status.",
  );
  const summary = message.split("\n")[0] ?? "";

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Textarea
        label="Release notes"
        value={releaseNotes}
        onValueChange={setReleaseNotes}
        description={`${releaseNotes.length} characters`}
      />
      <Textarea
        label="Commit message"
        minRows={2}
        value={message}
        onValueChange={setMessage}
        description="A summary line, a blank line, then the details"
        isInvalid={summary.length > 72}
        errorMessage={`The summary line has ${summary.length} characters; keep it to 72`}
      />
    </div>
  );
}
