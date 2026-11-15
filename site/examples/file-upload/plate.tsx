"use client";

import { useState } from "react";
import { FileUpload } from "cennge-ui";

const MB = 1024 * 1024;

// A bug report reopened as a draft: two files are attached already.
const draft = [
  new File([new Uint8Array(186_400)], "trace-webkit.zip", { type: "application/zip", lastModified: 1_793_000_000_000 }),
  new File([new Uint8Array(7_310)], "ci-run-1287.log", { type: "text/plain", lastModified: 1_793_000_000_000 }),
];

export default function FileUploadPlate() {
  const [attachments, setAttachments] = useState<File[]>(draft);
  const [preview, setPreview] = useState<File[]>([]);

  return (
    <>
      <FileUpload
        label="Attachments"
        description="Screenshots, logs or a trace, up to 10 MB each"
        accept={["image/*", ".log", ".txt", ".zip"]}
        maxSize={10 * MB}
        maxFiles={5}
        value={attachments}
        onValueChange={setAttachments}
        className="w-full max-w-96"
      />
      <FileUpload
        label="Social preview"
        description="PNG or JPG, up to 1 MB"
        variant="button"
        multiple={false}
        accept={["image/png", "image/jpeg"]}
        maxSize={MB}
        value={preview}
        onValueChange={setPreview}
        className="w-full max-w-96"
      />
    </>
  );
}
