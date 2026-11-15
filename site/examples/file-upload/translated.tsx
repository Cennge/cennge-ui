"use client";

import { CenngeProvider, FileUpload, type FileErrorCode } from "cennge-ui";

const reasons: Record<FileErrorCode, string> = {
  "file-invalid-type": "nur PDF",
  "file-too-large": "größer als 5 MB",
  "file-too-small": "zu klein",
  "too-many-files": "zu viele Dateien",
};

export default function GermanAttachments() {
  return (
    // The provider's locale formats the file sizes: 1,2 MB.
    <CenngeProvider locale="de-DE">
      <FileUpload
        label="Anhänge"
        description="PDF, bis 5 MB"
        accept=".pdf"
        maxSize={5 * 1024 * 1024}
        messages={{
          prompt: "Dateien hierher ziehen oder",
          browse: "auswählen",
          dropping: "Zum Hinzufügen loslassen",
          fileList: "Ausgewählte Dateien",
          remove: (name) => `${name} entfernen`,
          error: (code, file) => `${file.name}: ${reasons[code]}`,
        }}
        className="w-full max-w-96"
      />
    </CenngeProvider>
  );
}
