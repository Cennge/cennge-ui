import { useState } from "react";
import {
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useTableSelection,
  useTableSort,
} from "cennge-ui";

interface Repo {
  name: string;
  language: string;
  stars: number | null;
  release: string;
}

const repos: Repo[] = [
  { name: "ai-niche-scout", language: "Python", stars: 120, release: "v10" },
  { name: "cennge-ui", language: "TypeScript", stars: 940, release: "v9" },
  { name: "dotfiles", language: "Shell", stars: null, release: "v2" },
  { name: "Blog", language: "MDX", stars: 35, release: "v1" },
];

type Column = keyof Repo;

export default function TableFixture() {
  const [rows, setRows] = useState(repos);
  const [isLoading, setLoading] = useState(false);
  const { sortedRows, getSortProps } = useTableSort(rows, { getValue: (repo, column: Column) => repo[column] });
  const selection = useTableSelection(sortedRows.map((repo) => repo.name));

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setRows([])}>
          Empty
        </Button>
        <Button size="sm" onClick={() => setRows(repos)}>
          Fill
        </Button>
        <Button size="sm" onClick={() => setLoading((loading) => !loading)}>
          Toggle loading
        </Button>
      </div>
      <p>
        selected: <span data-testid="selected">{[...selection.selected].join(",")}</span>
      </p>

      <Table aria-label="Repositories" isHoverable isLoading={isLoading}>
        <TableHeader>
          <TableColumn className="w-10">
            <Checkbox
              aria-label="Select all"
              isSelected={selection.allSelected}
              isIndeterminate={selection.someSelected}
              onValueChange={selection.toggleAll}
            />
          </TableColumn>
          <TableColumn {...getSortProps("name")}>Name</TableColumn>
          <TableColumn {...getSortProps("language")}>Language</TableColumn>
          <TableColumn {...getSortProps("stars")} align="end">
            Stars
          </TableColumn>
          <TableColumn {...getSortProps("release")}>Release</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No repositories yet">
          {sortedRows.map((repo) => (
            <TableRow key={repo.name} isSelected={selection.isSelected(repo.name)}>
              <TableCell>
                <Checkbox
                  aria-label={`Select ${repo.name}`}
                  isSelected={selection.isSelected(repo.name)}
                  onValueChange={() => selection.toggle(repo.name)}
                />
              </TableCell>
              <TableCell className="font-medium">{repo.name}</TableCell>
              <TableCell>{repo.language}</TableCell>
              <TableCell align="end" className="tabular-nums">
                {repo.stars ?? "—"}
              </TableCell>
              <TableCell>{repo.release}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div data-testid="narrow" className="w-72">
        <Table aria-label="Workflow runs" isStriped isHeaderSticky size="sm" classNames={{ wrapper: "max-h-48" }}>
          <TableHeader>
            <TableColumn>Run</TableColumn>
            <TableColumn>Workflow</TableColumn>
            <TableColumn>Branch</TableColumn>
            <TableColumn>Duration</TableColumn>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 20 }, (_, index) => (
              <TableRow key={index}>
                <TableCell>#{1200 - index}</TableCell>
                <TableCell>ci / Playwright · webkit</TableCell>
                <TableCell>feature/table-component</TableCell>
                <TableCell>{3 + (index % 4)}m {10 + index}s</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
