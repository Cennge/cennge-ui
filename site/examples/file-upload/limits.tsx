"use client";

import { useState } from "react";
import { FileUpload } from "cennge-ui";

export default function Screenshots() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <FileUpload
      label="Screenshots"
      description="PNG or JPG, up to 2 MB, at most 3"
      accept={["image/png", "image/jpeg"]}
      maxSize={2 * 1024 * 1024}
      maxFiles={3}
      value={files}
      onValueChange={setFiles}
      className="w-full max-w-96"
    />
  );
}
