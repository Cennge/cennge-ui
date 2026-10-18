import { useState } from "react";
import { FileUpload } from "cennge-ui";

export default function FileUploadFixture() {
  const [files, setFiles] = useState<File[]>([]);
  const [rejected, setRejected] = useState("");
  const [submitted, setSubmitted] = useState("");

  return (
    <>
      <FileUpload
        label="Attachments"
        description="Images or PDF, up to 1 MB, at most 3"
        accept={["image/*", ".pdf"]}
        maxSize={1024 * 1024}
        maxFiles={3}
        value={files}
        onValueChange={setFiles}
        onReject={(rejections) =>
          setRejected(rejections.map((r) => `${r.file.name}:${r.errors.join("+")}`).join(","))
        }
      />
      <p>
        files: <span data-testid="files">{files.map((f) => f.name).join("|")}</span>
      </p>
      <p>
        rejected: <span data-testid="rejected">{rejected}</span>
      </p>

      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const names = new FormData(event.currentTarget).getAll("docs").map((entry) => (entry as File).name);
          setSubmitted(JSON.stringify(names));
        }}
      >
        <FileUpload label="Documents" name="docs" variant="button" description="Sent with the form" />
        <button type="submit" className="self-start rounded-small bg-surface-4 px-3 py-1.5 text-sm">
          Send
        </button>
      </form>
      <p>
        submitted: <span data-testid="submitted">{submitted}</span>
      </p>

      <FileUpload label="Locked" isDisabled />
    </>
  );
}
