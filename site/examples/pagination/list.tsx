"use client";

import { useState } from "react";
import { Pagination } from "cennge-ui";

const folders = [
  "accordion", "alert", "alert-dialog", "avatar", "badge", "breadcrumbs", "button", "calendar", "card", "carousel",
  "checkbox", "combobox", "command", "context-menu", "date-picker", "date-range-picker", "dialog", "drawer",
  "dropdown", "empty-state", "file-upload", "form", "hover-card", "indicator", "input", "kbd", "listbox",
  "navigation-menu", "number-input", "otp-input", "pagination", "password-input", "popover", "progress", "prose",
  "radio", "rating", "scroll-area", "select", "separator", "sidebar", "skeleton", "slider", "snippet", "spinner",
  "stepper", "switch", "table", "tabs", "tags-input", "textarea", "theme", "time-input", "timeline", "toast",
  "toggle-group", "tooltip", "tree", "virtual-list",
];

const pageSize = 12;

export default function FolderPages() {
  const [page, setPage] = useState(1);
  const total = Math.ceil(folders.length / pageSize);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <p className="text-sm text-muted">
        src/components: {folders.length} folders, page {page} of {total}
      </p>
      <ul className="grid min-h-36 grid-cols-2 content-start gap-x-6 gap-y-1.5 font-code text-[13px] sm:grid-cols-3">
        {folders.slice((page - 1) * pageSize, page * pageSize).map((folder) => (
          <li key={folder} className="truncate">
            {folder}/
          </li>
        ))}
      </ul>
      <Pagination aria-label="Folder pages" total={total} page={page} onPageChange={setPage} />
    </div>
  );
}
