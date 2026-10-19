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

/*
 * TanStack Table v9 owns sorting and paging; cennge-ui draws the table. Header sorting takes
 * column.getIsSorted() and column.getToggleSortingHandler() as they are.
 */

interface Repo {
  name: string;
  language: string;
  stars: number;
}

const languages = ["TypeScript", "Python", "Go", "Rust", "Shell"];
const data: Repo[] = Array.from({ length: 23 }, (_, index) => ({
  name: `service-${index + 1}`,
  language: languages[index % languages.length] ?? "TypeScript",
  stars: (index * 37) % 101,
}));

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

const helper = createColumnHelper<typeof features, Repo>();
const columns = helper.columns([
  helper.accessor("name", {
    header: "Repository",
    sortFn: (a, b, id) => collator.compare(String(a.getValue(id)), String(b.getValue(id))),
  }),
  helper.accessor("language", {
    header: "Language",
    sortFn: (a, b, id) => collator.compare(String(a.getValue(id)), String(b.getValue(id))),
  }),
  helper.accessor("stars", {
    header: "Stars",
    sortFn: (a, b, id) => Number(a.getValue(id)) - Number(b.getValue(id)),
  }),
]);

export default function TanStackTableFixture() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
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
    <div className="flex flex-col gap-3">
      <Table aria-label="Services">
        <TableHeader>
          {headers.map((header) => (
            <TableColumn
              key={header.id}
              onSort={header.column.getToggleSortingHandler()}
              sortDirection={header.column.getIsSorted()}
              align={header.column.id === "stars" ? "end" : "start"}
            >
              <table.FlexRender header={header} />
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id} align={cell.column.id === "stars" ? "end" : "start"}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        aria-label="Services pages"
        total={table.getPageCount()}
        page={pagination.pageIndex + 1}
        onPageChange={(page) => table.setPageIndex(page - 1)}
      />
    </div>
  );
}
