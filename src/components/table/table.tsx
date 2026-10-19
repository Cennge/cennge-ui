import * as React from "react";
import { tv } from "../../utils/tv";
import { useCenngeDefaults } from "../../provider";
import type { CenngeSize } from "../../types";
import { Spinner } from "../spinner";

// useLayoutEffect warns during SSR on React 17/18; it only matters in the browser anyway.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export type SortDirection = "ascending" | "descending";

const table = tv({
  slots: {
    wrapper: [
      "relative w-full overflow-auto rounded-large border border-border bg-surface-2",
      "[scrollbar-color:var(--cennge-border)_transparent] [scrollbar-width:thin]",
      "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring",
    ],
    table: "w-full border-separate border-spacing-0 text-foreground",
    column: [
      "border-b border-border bg-surface-3 px-3 text-left font-semibold whitespace-nowrap text-muted first:pl-4 last:pr-4",
      "data-[align=center]:text-center data-[align=end]:text-right",
    ],
    sortButton: [
      "-mx-1.5 inline-flex cursor-pointer items-center gap-1 rounded-small px-1.5 py-1 font-semibold text-inherit",
      "transition-colors duration-(--cennge-duration-fast) hover:bg-default-bg hover:text-foreground",
      "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring",
    ],
    row: "transition-colors duration-(--cennge-duration-fast) data-[selected]:bg-primary-bg",
    cell: [
      "border-b border-border/60 px-3 align-middle first:pl-4 last:pr-4 [tr:last-child>&]:border-b-0",
      "data-[align=center]:text-center data-[align=end]:text-right",
    ],
    state: "px-4 py-10 text-center text-sm text-muted",
  },
  variants: {
    size: {
      sm: { table: "text-xs", column: "h-8 text-xs", cell: "py-1.5" },
      md: { table: "text-sm", column: "h-10 text-xs", cell: "py-2.5" },
      lg: { table: "text-sm", column: "h-11 text-sm", cell: "py-3.5" },
    },
    isStriped: { true: { row: "even:bg-surface-3/50" } },
    isHoverable: { true: { row: "hover:bg-default-bg" } },
    isHeaderSticky: { true: { column: "sticky top-0 z-10" } },
    isLoading: { true: { table: "[&>tbody>tr:not([data-state])]:opacity-60" } },
  },
  defaultVariants: { size: "md" },
});

interface TableContextValue {
  slots: ReturnType<typeof table>;
  columnCount: number;
  isLoading: boolean;
}

const TableContext = React.createContext<TableContextValue | null>(null);

function useTableContext(part: string): TableContextValue {
  const context = React.useContext(TableContext);
  if (!context) throw new Error(`<${part}> must be used inside <Table>.`);
  return context;
}

type TableSlots = "wrapper" | "table";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Row height and text size. @default "md" */
  size?: CenngeSize;
  /** Tints every other row. */
  isStriped?: boolean;
  /** Highlights the row under the pointer. */
  isHoverable?: boolean;
  /** Keeps the header in view while the table scrolls; give the table a height through `classNames.wrapper`. */
  isHeaderSticky?: boolean;
  /** Dims the rows and marks the table busy, e.g. while the next page loads. */
  isLoading?: boolean;
  classNames?: Partial<Record<TableSlots, string>>;
}

/**
 * A data table: native table markup, so screen readers announce rows, columns and headers.
 * Name it with `aria-label` or `aria-labelledby`. Wide tables scroll sideways, and then the
 * scroll area takes keyboard focus so it can be scrolled with the arrows.
 */
export const Table = React.forwardRef<HTMLTableElement, TableProps>(function Table(props, ref) {
  const defaults = useCenngeDefaults();
  const {
    size = defaults.size ?? "md",
    isStriped = false,
    isHoverable = false,
    isHeaderSticky = false,
    isLoading = false,
    className,
    classNames,
    children,
    ...rest
  } = props;

  const tableRef = React.useRef<HTMLTableElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => tableRef.current as HTMLTableElement);

  // Empty and loading rows span every column: count them from the header.
  const [columnCount, setColumnCount] = React.useState(1);
  useIsomorphicLayoutEffect(() => {
    const count = tableRef.current?.tHead?.rows[0]?.cells.length;
    if (count && count !== columnCount) setColumnCount(count);
  });

  const [isScrollable, setScrollable] = React.useState(false);
  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || typeof ResizeObserver === "undefined") return;
    const check = () => setScrollable(wrapper.scrollWidth > wrapper.clientWidth + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(wrapper);
    if (tableRef.current) observer.observe(tableRef.current);
    return () => observer.disconnect();
  }, []);

  const slots = table({ size, isStriped, isHoverable, isHeaderSticky, isLoading });
  const label = rest["aria-label"];
  const labelledBy = rest["aria-labelledby"];

  return (
    <TableContext.Provider value={{ slots, columnCount, isLoading }}>
      <div
        ref={wrapperRef}
        // A sideways-scrolling table is a named region that the keyboard can scroll.
        {...(isScrollable
          ? { role: "region", tabIndex: 0, "aria-label": label, "aria-labelledby": labelledBy }
          : undefined)}
        className={slots.wrapper({ class: [classNames?.wrapper, className] })}
      >
        <table
          ref={tableRef}
          aria-busy={isLoading || undefined}
          className={slots.table({ class: classNames?.table })}
          {...rest}
        >
          {children}
        </table>
      </div>
    </TableContext.Provider>
  );
});

/* ---------------------------------------------------------------- header */

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  function TableHeader({ children, ...rest }, ref) {
    return (
      <thead ref={ref} {...rest}>
        <tr>{children}</tr>
      </thead>
    );
  },
);

function SortIcon({ direction }: { direction?: SortDirection | false }) {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      {direction === "ascending" ? (
        <path d="M7 14l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
      ) : direction === "descending" ? (
        <path d="M7 10l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M8 9.5l4-4 4 4M8 14.5l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      )}
    </svg>
  );
}

export interface TableColumnProps extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, "align"> {
  /**
   * Makes the column sortable: the header becomes a button that calls this with the click.
   * TanStack Table's `column.getToggleSortingHandler()` fits as is (Shift+click adds a sort).
   */
  onSort?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * Current sort of this column; `false` or omitted when it is not the sorted one. Also takes
   * TanStack Table's `column.getIsSorted()` ("asc" / "desc") as is.
   */
  sortDirection?: SortDirection | "asc" | "desc" | false;
  /** @default "start" */
  align?: "start" | "center" | "end";
}

export const TableColumn = React.forwardRef<HTMLTableCellElement, TableColumnProps>(function TableColumn(
  { onSort, sortDirection: sortProp, align = "start", className, children, ...rest },
  ref,
) {
  const { slots } = useTableContext("TableColumn");
  const sortDirection: SortDirection | false =
    sortProp === "asc" ? "ascending" : sortProp === "desc" ? "descending" : (sortProp ?? false);
  return (
    <th
      ref={ref}
      scope="col"
      aria-sort={onSort ? sortDirection || "none" : undefined}
      data-align={align}
      className={slots.column({ class: className })}
      {...rest}
    >
      {onSort ? (
        <button type="button" onClick={onSort} className={slots.sortButton()}>
          {children}
          <SortIcon direction={sortDirection} />
        </button>
      ) : (
        children
      )}
    </th>
  );
});

/* ------------------------------------------------------------------ body */

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  /** Shown in place of the rows when there are none, e.g. an EmptyState. */
  emptyContent?: React.ReactNode;
  /** Shown in place of the rows while the table is loading and has none yet. @default a spinner */
  loadingContent?: React.ReactNode;
}

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(function TableBody(
  { emptyContent, loadingContent, children, ...rest },
  ref,
) {
  const { slots, columnCount, isLoading } = useTableContext("TableBody");
  const isEmpty = React.Children.toArray(children).length === 0;
  const state = isEmpty
    ? isLoading
      ? (loadingContent ?? (
          <span className="inline-flex items-center gap-2">
            <Spinner size="sm" />
            Loading…
          </span>
        ))
      : emptyContent
    : null;
  return (
    <tbody ref={ref} {...rest}>
      {children}
      {state != null ? (
        <tr data-state="">
          <td colSpan={columnCount} className={slots.state()}>
            {state}
          </td>
        </tr>
      ) : null}
    </tbody>
  );
});

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Tints the row; pair it with a checkbox in the row for screen readers. */
  isSelected?: boolean;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { isSelected = false, className, ...rest },
  ref,
) {
  const { slots } = useTableContext("TableRow");
  return <tr ref={ref} data-selected={isSelected || undefined} className={slots.row({ class: className })} {...rest} />;
});

export interface TableCellProps extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "align"> {
  /** @default "start" */
  align?: "start" | "center" | "end";
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { align = "start", className, ...rest },
  ref,
) {
  const { slots } = useTableContext("TableCell");
  return <td ref={ref} data-align={align} className={slots.cell({ class: className })} {...rest} />;
});
