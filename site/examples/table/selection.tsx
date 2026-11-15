"use client";

import { useState } from "react";
import {
  Button,
  Checkbox,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useTableSelection,
} from "cennge-ui";

interface Preview {
  id: string;
  repository: string;
  branch: string;
}

const initialPreviews: Preview[] = [
  { id: "p1", repository: "cennge-ui", branch: "docs/table" },
  { id: "p2", repository: "cennge-ui", branch: "feat/tree-lazy" },
  { id: "p3", repository: "payload-cache", branch: "fix/ttl" },
  { id: "p4", repository: "payload-cache", branch: "feat/redis-adapter" },
  { id: "p5", repository: "ai-niche-scout", branch: "feat/keyword-score" },
  { id: "p6", repository: "ai-niche-scout", branch: "chore/deps" },
  { id: "p7", repository: "spredo-crypto-screener", branch: "feat/funding-rates" },
  { id: "p8", repository: "spredo-crypto-screener", branch: "fix/ws-reconnect" },
  { id: "p9", repository: "playwright-msi-scraper", branch: "feat/retries" },
  { id: "p10", repository: "playwright-msi-scraper", branch: "chore/playwright-update" },
];

const pageSize = 4;

export default function PreviewCleanup() {
  const [previews, setPreviews] = useState(initialPreviews);
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(previews.length / pageSize));
  const current = Math.min(page, pages);
  const onScreen = previews.slice((current - 1) * pageSize, current * pageSize);
  // "All" means the rows on this page; the selection keeps rows ticked on other pages.
  const selection = useTableSelection(onScreen.map((preview) => preview.id));
  const count = selection.selected.size;

  const remove = () => {
    setPreviews((list) => list.filter((preview) => !selection.isSelected(preview.id)));
    selection.clear();
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex min-h-8 items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {count ? `${count} selected across pages` : `${previews.length} preview deployments`}
        </p>
        <Button size="sm" variant="flat" color="danger" isDisabled={!count} onClick={remove}>
          Delete
        </Button>
      </div>
      <Table aria-label="Preview deployments">
        <TableHeader>
          <TableColumn className="w-10">
            <Checkbox
              aria-label="Select all on this page"
              isSelected={selection.allSelected}
              isIndeterminate={selection.someSelected}
              onValueChange={selection.toggleAll}
            />
          </TableColumn>
          <TableColumn>Branch</TableColumn>
          <TableColumn>Repository</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No preview deployments left">
          {onScreen.map((preview) => (
            <TableRow key={preview.id} isSelected={selection.isSelected(preview.id)} className="whitespace-nowrap">
              <TableCell>
                <Checkbox
                  aria-label={`Select ${preview.branch}`}
                  isSelected={selection.isSelected(preview.id)}
                  onValueChange={() => selection.toggle(preview.id)}
                />
              </TableCell>
              <TableCell className="font-mono text-[13px]">{preview.branch}</TableCell>
              <TableCell className="text-muted">{preview.repository}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination aria-label="Preview pages" total={pages} page={current} onPageChange={setPage} className="self-center" />
    </div>
  );
}
