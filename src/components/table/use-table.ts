import * as React from "react";
import { useCenngeDefaults } from "../../provider";
import type { SortDirection } from "./table";

export interface SortDescriptor<K extends string = string> {
  column: K;
  direction: SortDirection;
}

type SortValue = string | number | Date | null | undefined;

export interface UseTableSortOptions<T, K extends string> {
  /** A row's value in a column. Numbers and dates compare as such; text by the locale, with digits as numbers. */
  getValue: (row: T, column: K) => SortValue;
  defaultSort?: SortDescriptor<K> | null;
  /** @default the provider's locale, else "en-US" */
  locale?: string;
}

/**
 * Client-side sorting for a Table. Spread `getSortProps(column)` on a TableColumn: the first click
 * sorts ascending, the next descending. Empty values always go last.
 */
export function useTableSort<T, K extends string>(rows: readonly T[], options: UseTableSortOptions<T, K>) {
  const defaults = useCenngeDefaults();
  const { getValue, defaultSort = null, locale = defaults.locale ?? "en-US" } = options;
  const [sort, setSort] = React.useState<SortDescriptor<K> | null>(defaultSort);
  const collator = React.useMemo(() => new Intl.Collator(locale, { numeric: true, sensitivity: "base" }), [locale]);

  let sortedRows: readonly T[] = rows;
  if (sort) {
    const sign = sort.direction === "ascending" ? 1 : -1;
    sortedRows = [...rows].sort((rowA, rowB) => {
      const a = getValue(rowA, sort.column);
      const b = getValue(rowB, sort.column);
      const isEmptyA = a == null || a === "";
      const isEmptyB = b == null || b === "";
      if (isEmptyA || isEmptyB) return isEmptyA === isEmptyB ? 0 : isEmptyA ? 1 : -1;
      if (typeof a === "number" && typeof b === "number") return sign * (a - b);
      if (a instanceof Date && b instanceof Date) return sign * (a.getTime() - b.getTime());
      return sign * collator.compare(String(a), String(b));
    });
  }

  const getSortProps = (column: K) => ({
    sortDirection: sort?.column === column ? sort.direction : (false as const),
    onSort: () =>
      setSort((current) =>
        current?.column === column && current.direction === "ascending"
          ? { column, direction: "descending" }
          : { column, direction: "ascending" },
      ),
  });

  return { sortedRows, sort, setSort, getSortProps };
}

/**
 * Row selection for a Table with checkboxes. `keys` are the rows on screen: "all" and "some" refer to
 * them, while the selection itself keeps rows from other pages.
 */
export function useTableSelection<K>(keys: readonly K[], options: { defaultSelected?: Iterable<K> } = {}) {
  const [selected, setSelected] = React.useState<Set<K>>(() => new Set(options.defaultSelected));
  const selectedOnScreen = keys.filter((key) => selected.has(key)).length;
  const allSelected = keys.length > 0 && selectedOnScreen === keys.length;
  const someSelected = selectedOnScreen > 0 && !allSelected;

  const toggle = (key: K) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const toggleAll = () =>
    setSelected((current) => {
      const next = new Set(current);
      for (const key of keys) {
        if (allSelected) next.delete(key);
        else next.add(key);
      }
      return next;
    });

  return {
    selected,
    setSelected,
    isSelected: (key: K) => selected.has(key),
    toggle,
    toggleAll,
    clear: () => setSelected(new Set<K>()),
    allSelected,
    someSelected,
  };
}
