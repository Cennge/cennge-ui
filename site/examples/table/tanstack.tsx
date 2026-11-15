"use client";

import { useState } from "react";
import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "cennge-ui";

interface Run {
  repository: string;
  number: number;
  seconds: number;
}

const repositories = ["cennge-ui", "ai-niche-scout", "payload-cache", "spredo-crypto-screener", "playwright-msi-scraper"];
const data: Run[] = Array.from({ length: 24 }, (_, index) => ({
  repository: repositories[index % repositories.length]!,
  number: 200 - index,
  seconds: 45 + ((index * 97) % 380),
}));

const duration = (seconds: number) => (seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`);
const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

const helper = createColumnHelper<typeof features, Run>();
const columns = helper.columns([
  helper.accessor("repository", {
    header: "Repository",
    sortFn: (a, b, id) => collator.compare(String(a.getValue(id)), String(b.getValue(id))),
  }),
  helper.accessor("number", {
    header: "Run",
    cell: (cell) => `#${cell.getValue()}`,
    sortFn: (a, b, id) => Number(a.getValue(id)) - Number(b.getValue(id)),
  }),
  helper.accessor("seconds", {
    header: "Took",
    cell: (cell) => duration(cell.getValue()),
    sortFn: (a, b, id) => Number(a.getValue(id)) - Number(b.getValue(id)),
  }),
]);

const numeric = new Set(["number", "seconds"]);

export default function RunsWithTanStack() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 6 });
  const table = useTable({
    features,
    columns,
    data,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });
  const headers = table.getHeaderGroups()[0]?.headers ?? [];

  return (
    <div className="flex w-full flex-col gap-3">
      <Table aria-label="Recent workflow runs">
        <TableHeader>
          {headers.map((header) => (
            <TableColumn
              key={header.id}
              onSort={header.column.getToggleSortingHandler()}
              sortDirection={header.column.getIsSorted()}
              align={numeric.has(header.column.id) ? "end" : "start"}
            >
              <table.FlexRender header={header} />
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="whitespace-nowrap">
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id} align={numeric.has(cell.column.id) ? "end" : "start"} className="tabular-nums">
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        aria-label="Recent workflow run pages"
        total={table.getPageCount()}
        page={pagination.pageIndex + 1}
        onPageChange={(page) => table.setPageIndex(page - 1)}
        className="self-center"
      />
    </div>
  );
}
