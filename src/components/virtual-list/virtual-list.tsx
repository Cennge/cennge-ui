import * as React from "react";
import { ScrollArea, type ScrollAreaProps } from "../scroll-area";
import { useVirtualizer, type Virtualizer } from "./use-virtualizer";

export interface VirtualListProps<T> extends Omit<ScrollAreaProps, "children" | "orientation" | "viewportRef"> {
  items: readonly T[];
  /** Renders one item. Only items in view (and a few around) are rendered. */
  children: (item: T, index: number) => React.ReactNode;
  /** A stable key per item, e.g. its id. @default the index */
  getKey?: (item: T, index: number) => React.Key;
  /** Height of an item before it is measured, in px. Items may differ; each is measured once shown. @default 40 */
  estimateSize?: number | ((index: number) => number);
  /** @default 6 */
  overscan?: number;
  /** Receives scrollToIndex, e.g. to jump to a search result. */
  listRef?: React.Ref<Pick<Virtualizer, "scrollToIndex">>;
  /** Classes for the element that holds the items. */
  listClassName?: string;
}

/**
 * A long list (thousands of rows) that renders only what is in view, in a ScrollArea. Screen readers hear
 * the full size and each row's position ("row 4,812 of 10,000"); with `aria-label` the area is a region.
 */
export function VirtualList<T>({
  items,
  children,
  getKey,
  estimateSize = 40,
  overscan,
  listRef,
  listClassName,
  ...rest
}: VirtualListProps<T>) {
  const [scrollElement, setScrollElement] = React.useState<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({ count: items.length, estimateSize, overscan, scrollElement });
  React.useImperativeHandle(listRef, () => ({ scrollToIndex: virtualizer.scrollToIndex }), [virtualizer.scrollToIndex]);

  return (
    <ScrollArea viewportRef={setScrollElement} {...rest}>
      <div role="list" className={listClassName} style={{ position: "relative", height: virtualizer.totalSize }}>
        {virtualizer.items.map(({ index, start }) => {
          const item = items[index] as T;
          return (
            <div
              key={getKey ? getKey(item, index) : index}
              ref={virtualizer.measureElement}
              data-index={index}
              role="listitem"
              aria-setsize={items.length}
              aria-posinset={index + 1}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${start}px)` }}
            >
              {children(item, index)}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
