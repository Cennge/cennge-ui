import { useState, type ReactNode } from "react";
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
import {
  Badge,
  Button,
  Checkbox,
  EmptyState,
  Input,
  Pagination,
  Switch,
  Snippet,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  toast,
  Tree,
  type TreeItem,
  useTableSelection,
  useTableSort,
} from "cennge-ui";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-large bg-surface-2 p-6 shadow-raised">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

interface Repo {
  name: string;
  language: string;
  stars: number | null;
  release: string;
  updated: Date;
}

const repos: Repo[] = [
  { name: "ai-niche-scout", language: "Python", stars: 120, release: "v10", updated: new Date("2026-10-17") },
  { name: "cennge-ui", language: "TypeScript", stars: 940, release: "v9", updated: new Date("2026-10-19") },
  { name: "dotfiles", language: "Shell", stars: null, release: "v2", updated: new Date("2025-03-02") },
  { name: "blog", language: "MDX", stars: 35, release: "v1", updated: new Date("2026-06-11") },
  { name: "telegram-digest-bot", language: "Go", stars: 210, release: "v3", updated: new Date("2026-09-28") },
];

type RepoColumn = "name" | "language" | "stars" | "release" | "updated";
const dateFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", year: "numeric" });

function Repositories() {
  const [query, setQuery] = useState("");
  const [isLoading, setLoading] = useState(false);
  const visible = repos.filter((repo) => repo.name.includes(query.trim().toLowerCase()));
  const { sortedRows, getSortProps } = useTableSort(visible, {
    getValue: (repo, column: RepoColumn) => repo[column],
    defaultSort: { column: "updated", direction: "descending" },
  });
  const selection = useTableSelection(sortedRows.map((repo) => repo.name));
  const selectedCount = sortedRows.filter((repo) => selection.isSelected(repo.name)).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Input label="Поиск по репозиториям" placeholder="Название" value={query} onValueChange={setQuery} isClearable className="max-w-xs" />
        <Switch isSelected={isLoading} onValueChange={setLoading} size="sm">
          Загрузка
        </Switch>
      </div>
      {selectedCount > 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-medium bg-primary-bg px-4 py-2 text-sm">
          <span>Выбрано: {selectedCount}</span>
          <Button
            size="sm"
            color="primary"
            onClick={() => {
              toast.success(`В архив: ${selectedCount}`);
              selection.clear();
            }}
          >
            В архив
          </Button>
        </div>
      ) : null}
      <Table aria-label="Репозитории" isHoverable isLoading={isLoading}>
        <TableHeader>
          <TableColumn className="w-10">
            <Checkbox
              aria-label="Выбрать все"
              isSelected={selection.allSelected}
              isIndeterminate={selection.someSelected}
              onValueChange={selection.toggleAll}
            />
          </TableColumn>
          <TableColumn {...getSortProps("name")}>Репозиторий</TableColumn>
          <TableColumn {...getSortProps("language")}>Язык</TableColumn>
          <TableColumn {...getSortProps("stars")} align="end">
            Звёзды
          </TableColumn>
          <TableColumn {...getSortProps("release")}>Релиз</TableColumn>
          <TableColumn {...getSortProps("updated")}>Обновлён</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={
            <EmptyState
              title="Ничего не найдено"
              description={`Нет репозиториев с «${query}» в названии`}
              actions={
                <Button size="sm" variant="flat" onClick={() => setQuery("")}>
                  Сбросить поиск
                </Button>
              }
            />
          }
        >
          {sortedRows.map((repo) => (
            <TableRow key={repo.name} isSelected={selection.isSelected(repo.name)}>
              <TableCell>
                <Checkbox
                  aria-label={`Выбрать ${repo.name}`}
                  isSelected={selection.isSelected(repo.name)}
                  onValueChange={() => selection.toggle(repo.name)}
                />
              </TableCell>
              <TableCell className="font-medium">{repo.name}</TableCell>
              <TableCell>
                <Badge variant="flat" size="sm">
                  {repo.language}
                </Badge>
              </TableCell>
              <TableCell align="end" className="tabular-nums">
                {repo.stars ?? "—"}
              </TableCell>
              <TableCell>{repo.release}</TableCell>
              <TableCell className="whitespace-nowrap text-muted">{dateFormat.format(repo.updated)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface Service {
  name: string;
  language: string;
  stars: number;
}

const services: Service[] = Array.from({ length: 23 }, (_, index) => ({
  name: `service-${index + 1}`,
  language: ["TypeScript", "Python", "Go", "Rust", "Shell"][index % 5] ?? "TypeScript",
  stars: (index * 37) % 101,
}));

const collator = new Intl.Collator("ru", { numeric: true, sensitivity: "base" });
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});
const helper = createColumnHelper<typeof features, Service>();
const columns = helper.columns([
  helper.accessor("name", {
    header: "Сервис",
    sortFn: (a, b, id) => collator.compare(String(a.getValue(id)), String(b.getValue(id))),
  }),
  helper.accessor("language", {
    header: "Язык",
    sortFn: (a, b, id) => collator.compare(String(a.getValue(id)), String(b.getValue(id))),
  }),
  helper.accessor("stars", { header: "Звёзды", sortFn: (a, b, id) => Number(a.getValue(id)) - Number(b.getValue(id)) }),
]);

function Services() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const table = useTable({
    features,
    columns,
    data: services,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });
  return (
    <div className="flex flex-col gap-3">
      <Table aria-label="Сервисы" size="sm" isStriped>
        <TableHeader>
          {(table.getHeaderGroups()[0]?.headers ?? []).map((header) => (
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
        total={table.getPageCount()}
        page={pagination.pageIndex + 1}
        onPageChange={(page) => table.setPageIndex(page - 1)}
        size="sm"
      />
      <p className="text-xs text-muted">Сортировку и страницы считает TanStack Table v9; Shift+клик добавляет вторую сортировку.</p>
    </div>
  );
}

const repositoryFiles: TreeItem[] = [
  { id: ".github", label: ".github", children: [{ id: ".github/workflows/ci.yml", label: "ci.yml" }] },
  {
    id: "src",
    label: "src",
    children: [
      {
        id: "src/components",
        label: "components",
        children: ["button.tsx", "calendar.tsx", "table.tsx", "tree.tsx"].map((name) => ({
          id: `src/components/${name}`,
          label: name,
        })),
      },
      { id: "src/index.ts", label: "index.ts" },
      { id: "src/styles.css", label: "styles.css" },
    ],
  },
  { id: "docs", label: "docs", hasChildren: true },
  { id: "README.md", label: "README.md" },
  { id: "package.json", label: "package.json" },
];

// Imitates fetching a folder from the GitHub API.
const loadFolder = () =>
  new Promise<TreeItem[]>((resolve) =>
    setTimeout(
      () =>
        resolve([
          { id: "docs/theming.md", label: "theming.md" },
          { id: "docs/testing.md", label: "testing.md" },
        ]),
      900,
    ),
  );

function Files() {
  const [opened, setOpened] = useState("src/index.ts");
  return (
    <div className="grid gap-4 sm:grid-cols-[16rem_1fr]">
      <Tree
        aria-label="Файлы cennge-ui"
        items={repositoryFiles}
        defaultExpandedKeys={["src", "src/components"]}
        defaultSelectedKey="src/index.ts"
        loadChildren={loadFolder}
        onAction={(item) => setOpened(item.id)}
        className="rounded-large bg-surface-1 p-1.5"
      />
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-sm font-semibold">{opened}</p>
        <Snippet symbol={false} copyLabel="Скопировать путь" copiedLabel="Путь скопирован" className="w-full">
          {`https://github.com/Cennge/cennge-ui/blob/main/${opened}`}
        </Snippet>
        <p className="text-xs text-muted">
          ↑/↓ — по файлам, → и ← — открыть и закрыть папку, буква — переход по имени, * — открыть все папки уровня.
          Папка docs загружается при первом открытии.
        </p>
      </div>
    </div>
  );
}

export function DataDemo() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Section title="Table">
          <Repositories />
        </Section>
        <Section title="Table + TanStack Table">
          <Services />
        </Section>
      </div>
      <Section title="Tree">
        <Files />
      </Section>
    </div>
  );
}
