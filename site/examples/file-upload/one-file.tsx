"use client";

import { useState } from "react";
import { FileUpload } from "cennge-ui";

export default function ReleaseAsset() {
  const [asset, setAsset] = useState<File[]>([]);
  return (
    <FileUpload
      label="Release asset"
      description="The .tgz that npm pack wrote"
      variant="button"
      multiple={false}
      accept=".tgz"
      value={asset}
      onValueChange={setAsset}
      className="w-full max-w-96"
    />
  );
}
