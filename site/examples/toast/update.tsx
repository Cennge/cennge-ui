"use client";

import { useState } from "react";
import { Button, toast } from "cennge-ui";

const files = ["home-dark.png", "home-light.png", "combobox.png", "map-new-york.png"];
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function UploadScreenshots() {
  const [isUploading, setUploading] = useState(false);

  async function upload() {
    setUploading(true);
    const id = toast("Uploading screenshots", { description: `0 of ${files.length}`, isLoading: true });
    for (const [index, file] of files.entries()) {
      await wait(700); // stands in for the upload of `file`
      toast("Uploading screenshots", { id, description: `${index + 1} of ${files.length}: ${file}` });
    }
    toast.success("Screenshots uploaded", { id, description: `${files.length} files`, isLoading: false });
    setUploading(false);
  }

  return (
    <Button variant="flat" isLoading={isUploading} onClick={upload}>
      Upload {files.length} screenshots
    </Button>
  );
}
