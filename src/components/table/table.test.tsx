import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Checkbox } from "../checkbox";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "./table";
import { useTableSelection, useTableSort } from "./use-table";

interface Repo {
  name: string;
  stars: number | null;
  release: string;
}

const repos: Repo[] = [
  { name: "ai-niche-scout", stars: 120, release: "v10" },
  { name: "cennge-ui", stars: 940, release: "v9" },
  { name: "dotfiles", stars: null, release: "v2" },
  { name: "Blog", stars: 35, release: "v1" },
];

function Repos({ initialPage = repos }: { initialPage?: Repo[] }) {
  const [rows, setRows] = useState(initialPage);
  const { sortedRows, getSortProps } = useTableSort(rows, {
    getValue: (repo, column: "name" | "stars" | "release") => repo[column],
  });
  const selection = useTableSelection(sortedRows.map((repo) => repo.name));
  return (
    <>
      <button onClick={() => setRows(repos.slice(0, 2))}>Page 1</button>
      <button onClick={() => setRows(repos.slice(2))}>Page 2</button>
      <p data-testid="selected">{[...selection.selected].join(",")}</p>
      <Table aria-label="Repositories">
        <TableHeader>
          <TableColumn>
            <Checkbox
              aria-label="Select all"
              isSelected={selection.allSelected}
              isIndeterminate={selection.someSelected}
              onValueChange={selection.toggleAll}
            />
          </TableColumn>
          <TableColumn {...getSortProps("name")}>Name</TableColumn>
          <TableColumn {...getSortProps("stars")} align="end">
            Stars
          </TableColumn>
          <TableColumn {...getSortProps("release")}>Release</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No repositories">
          {sortedRows.map((repo) => (
            <TableRow key={repo.name} isSelected={selection.isSelected(repo.name)}>
              <TableCell>
                <Checkbox
                  aria-label={`Select ${repo.name}`}
                  isSelected={selection.isSelected(repo.name)}
                  onValueChange={() => selection.toggle(repo.name)}
                />
              </TableCell>
              <TableCell>{repo.name}</TableCell>
              <TableCell align="end">{repo.stars ?? "—"}</TableCell>
              <TableCell>{repo.release}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

const names = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[1]?.textContent);
const header = (name: string) => screen.getByRole("columnheader", { name: new RegExp(name) });

describe("Table", () => {
  it("is a named table with column headers", () => {
    render(<Repos />);
    expect(screen.getByRole("table", { name: "Repositories" })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(4);
    expect(screen.getAllByRole("row")).toHaveLength(5);
  });

  it("sortable headers are buttons with aria-sort; text sorts by the locale, digits as numbers", () => {
    render(<Repos />);
    expect(header("Name")).toHaveAttribute("aria-sort", "none");
    fireEvent.click(screen.getByRole("button", { name: "Name" }));
    expect(header("Name")).toHaveAttribute("aria-sort", "ascending");
    expect(names()).toEqual(["ai-niche-scout", "Blog", "cennge-ui", "dotfiles"]);
    fireEvent.click(screen.getByRole("button", { name: "Name" }));
    expect(header("Name")).toHaveAttribute("aria-sort", "descending");
    expect(names()).toEqual(["dotfiles", "cennge-ui", "Blog", "ai-niche-scout"]);
    fireEvent.click(screen.getByRole("button", { name: "Release" }));
    expect(header("Name")).toHaveAttribute("aria-sort", "none");
    expect(names()).toEqual(["Blog", "dotfiles", "cennge-ui", "ai-niche-scout"]); // v1, v2, v9, v10
  });

  it("numbers sort as numbers, and empty values stay last both ways", () => {
    render(<Repos />);
    const stars = screen.getByRole("button", { name: "Stars" });
    fireEvent.click(stars);
    expect(names()).toEqual(["Blog", "ai-niche-scout", "cennge-ui", "dotfiles"]);
    fireEvent.click(stars);
    expect(names()).toEqual(["cennge-ui", "ai-niche-scout", "Blog", "dotfiles"]);
  });

  it("selects rows one by one or all at once; the header box shows a partial selection", () => {
    render(<Repos />);
    const all = screen.getByRole("checkbox", { name: "Select all" });
    fireEvent.click(screen.getByRole("checkbox", { name: "Select cennge-ui" }));
    expect(all).toHaveAttribute("aria-checked", "mixed");
    expect(screen.getByRole("checkbox", { name: "Select cennge-ui" }).closest("tr")).toHaveAttribute("data-selected");
    fireEvent.click(all);
    expect(screen.getByTestId("selected").textContent?.split(",")).toHaveLength(4);
    fireEvent.click(all);
    expect(screen.getByTestId("selected")).toHaveTextContent("");
  });

  it("keeps the selection across pages; 'all' refers to the rows on screen", () => {
    render(<Repos />);
    fireEvent.click(screen.getByRole("button", { name: "Page 1" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all" }));
    fireEvent.click(screen.getByRole("button", { name: "Page 2" }));
    expect(screen.getByRole("checkbox", { name: "Select all" })).not.toBeChecked();
    expect(screen.getByTestId("selected")).toHaveTextContent("ai-niche-scout,cennge-ui");
  });

  it("an empty body spans every column with its message", () => {
    render(<Repos initialPage={[]} />);
    const cell = screen.getByRole("cell", { name: "No repositories" });
    expect(cell).toHaveAttribute("colspan", "4");
  });

  it("loading marks the table busy and shows a spinner while there are no rows", () => {
    const { rerender } = render(
      <Table aria-label="Builds" isLoading>
        <TableHeader>
          <TableColumn>Build</TableColumn>
          <TableColumn>Status</TableColumn>
        </TableHeader>
        <TableBody>{[]}</TableBody>
      </Table>,
    );
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("cell", { name: "Loading…" })).toHaveAttribute("colspan", "2");
    rerender(
      <Table aria-label="Builds">
        <TableHeader>
          <TableColumn>Build</TableColumn>
          <TableColumn>Status</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No builds yet">{[]}</TableBody>
      </Table>,
    );
    expect(screen.getByRole("table")).not.toHaveAttribute("aria-busy");
    expect(screen.getByRole("cell", { name: "No builds yet" })).toBeInTheDocument();
  });
});
