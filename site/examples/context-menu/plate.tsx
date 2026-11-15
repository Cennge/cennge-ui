"use client";

import { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
  toast,
} from "cennge-ui";

const folder = "src/components/button";
const all = ["button.styles.ts", "button.test.tsx", "button.tsx", "index.ts"];

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const icons = {
  file: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5",
  folder: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z",
  open: "M14 4h6v6m0-6-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1",
  trash: "M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13",
};

async function copyPath(path: string) {
  try {
    await navigator.clipboard.writeText(path);
    toast.success("Path copied", { description: path });
  } catch {
    toast.danger("Could not copy", { description: path });
  }
}

export default function ContextMenuPlate() {
  const [files, setFiles] = useState(all);

  function remove(file: string) {
    const before = files;
    setFiles(before.filter((name) => name !== file));
    toast(`Deleted ${file}`, { action: { label: "Undo", onClick: () => setFiles(before) } });
  }

  return (
    <div className="w-full max-w-md">
      <p className="flex items-center gap-2 text-sm font-semibold text-muted">
        <Icon d={icons.folder} />
        {folder}
      </p>
      <ul className="mt-2 grid gap-0.5">
        {files.map((file) => (
          <li key={file}>
            <ContextMenu>
              <ContextMenuTrigger>
                <div className="flex items-center gap-2.5 rounded-small px-2.5 py-2 font-mono text-sm select-none hover:bg-surface-3 data-[state=open]:bg-primary-bg data-[state=open]:text-primary-text">
                  <span className="text-muted">
                    <Icon d={icons.file} />
                  </span>
                  {file}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuLabel>{file}</ContextMenuLabel>
                <ContextMenuItem
                  startContent={<Icon d={icons.open} />}
                  onAction={() => window.open(`https://github.com/Cennge/cennge-ui/blob/main/${folder}/${file}`, "_blank")}
                >
                  Open on GitHub
                </ContextMenuItem>
                <ContextMenuItem startContent={<Icon d={icons.copy} />} onAction={() => copyPath(`${folder}/${file}`)}>
                  Copy path
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem color="danger" startContent={<Icon d={icons.trash} />} onAction={() => remove(file)}>
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </li>
        ))}
      </ul>
    </div>
  );
}
