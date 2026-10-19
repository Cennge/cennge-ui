import * as React from "react";

export interface VirtualItem {
  index: number;
  /** Offset of the item's top from the top of the scrolling content, in px. */
  start: number;
  size: number;
}

export interface VirtualizerOptions {
  count: number;
  /** Height of an item before it has been measured, in px. @default 40 */
  estimateSize?: number | ((index: number) => number);
  /** Items rendered beyond each edge of the view, so fast scrolling does not show gaps. @default 6 */
  overscan?: number;
  /** The scrolling element (the same element you render the items in). */
  scrollElement: HTMLElement | null;
  /** Space above the first item inside the scrolling element, e.g. padding or a header. */
  paddingStart?: number;
  paddingEnd?: number;
  /** Height assumed before the element is measured, e.g. while rendering on the server. @default 600 */
  initialHeight?: number;
}

export interface Virtualizer {
  /** The items to render now, with their position. */
  items: VirtualItem[];
  /** Height of all items together: the height of the element that holds them. */
  totalSize: number;
  /** Scroll so the item is in view; "auto" scrolls only as far as needed. */
  scrollToIndex: (index: number, options?: { align?: "auto" | "start" | "center" | "end" }) => void;
  /** Ref for each rendered item (with data-index), so items of any height are measured and placed. */
  measureElement: (node: HTMLElement | null) => void;
  /** Position of any item, rendered or not, e.g. to keep the active option of a list in the DOM. */
  getItem: (index: number) => VirtualItem;
}

/**
 * Renders only what is in view out of thousands of items. Items may differ in height: each is measured
 * when rendered, and the scroll position holds still when an item above the view changes size.
 */
export function useVirtualizer({
  count,
  estimateSize = 40,
  overscan = 6,
  scrollElement,
  paddingStart = 0,
  paddingEnd = 0,
  initialHeight = 600,
}: VirtualizerOptions): Virtualizer {
  const measured = React.useRef(new Map<number, number>());
  const [version, setVersion] = React.useState(0);
  const [view, setView] = React.useState({ top: 0, height: 0 });
  const estimate = React.useCallback(
    (index: number) => (typeof estimateSize === "function" ? estimateSize(index) : estimateSize),
    [estimateSize],
  );

  // Where every item starts: running sums of measured or estimated heights.
  const starts = React.useMemo(() => {
    const list = new Float64Array(count + 1);
    let position = paddingStart;
    for (let index = 0; index < count; index++) {
      list[index] = position;
      position += measured.current.get(index) ?? estimate(index);
    }
    list[count] = position;
    return list;
    // `version` changes when a measurement does.
  }, [count, estimate, paddingStart, version]);
  const startsRef = React.useRef(starts);
  startsRef.current = starts;

  React.useEffect(() => {
    if (!scrollElement) return;
    let frame = 0;
    const read = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setView((previous) =>
          previous.top === scrollElement.scrollTop && previous.height === scrollElement.clientHeight
            ? previous
            : { top: scrollElement.scrollTop, height: scrollElement.clientHeight },
        ),
      );
    };
    setView({ top: scrollElement.scrollTop, height: scrollElement.clientHeight });
    scrollElement.addEventListener("scroll", read, { passive: true });
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(read);
    resize?.observe(scrollElement);
    return () => {
      cancelAnimationFrame(frame);
      scrollElement.removeEventListener("scroll", read);
      resize?.disconnect();
    };
  }, [scrollElement]);

  // One observer for all rendered items.
  const viewRef = React.useRef(view);
  viewRef.current = view;
  const itemObserver = React.useMemo(() => {
    if (typeof ResizeObserver === "undefined") return null;
    return new ResizeObserver((entries) => {
      let changed = false;
      let shift = 0;
      for (const entry of entries) {
        const node = entry.target as HTMLElement;
        const index = Number(node.dataset.index);
        if (!node.isConnected || Number.isNaN(index)) continue;
        const size = node.getBoundingClientRect().height;
        const previous = measured.current.get(index) ?? estimate(index);
        if (Math.abs(size - previous) < 0.5) continue;
        measured.current.set(index, size);
        changed = true;
        // An item above the view grew or shrank: move the scroll by as much, so what is in view stays put.
        if ((startsRef.current[index] ?? 0) < viewRef.current.top) shift += size - previous;
      }
      if (shift && scrollElement) scrollElement.scrollTop += shift;
      if (changed) setVersion((value) => value + 1);
    });
  }, [estimate, scrollElement]);
  React.useEffect(() => () => itemObserver?.disconnect(), [itemObserver]);

  const measureElement = React.useCallback(
    (node: HTMLElement | null) => {
      if (node && itemObserver) itemObserver.observe(node);
    },
    [itemObserver],
  );

  // A new item count can leave measurements of items that no longer exist: forget them.
  React.useEffect(() => {
    for (const index of measured.current.keys()) if (index >= count) measured.current.delete(index);
  }, [count]);

  const height = view.height || initialHeight;
  /** Last index whose start is at or above `y`. */
  const indexAt = (y: number) => {
    let low = 0;
    let high = count - 1;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if ((starts[middle] ?? 0) <= y) low = middle;
      else high = middle - 1;
    }
    return low;
  };

  const items: VirtualItem[] = [];
  if (count > 0) {
    const first = Math.max(0, indexAt(view.top) - overscan);
    const last = Math.min(count - 1, indexAt(view.top + height) + overscan);
    for (let index = first; index <= last; index++) {
      const start = starts[index] ?? 0;
      items.push({ index, start, size: (starts[index + 1] ?? start) - start });
    }
  }

  const scrollToIndex = React.useCallback<Virtualizer["scrollToIndex"]>(
    (index, { align = "auto" } = {}) => {
      if (!scrollElement || count === 0) return;
      const clamped = Math.min(Math.max(index, 0), count - 1);
      const list = startsRef.current;
      const start = list[clamped] ?? 0;
      const end = list[clamped + 1] ?? start;
      const top = scrollElement.scrollTop;
      const viewHeight = scrollElement.clientHeight;
      let next = top;
      if (align === "start") next = start;
      else if (align === "end") next = end - viewHeight;
      else if (align === "center") next = start - (viewHeight - (end - start)) / 2;
      else if (start < top) next = start;
      else if (end > top + viewHeight) next = end - viewHeight;
      if (next !== top) scrollElement.scrollTop = Math.max(0, next);
    },
    [scrollElement, count],
  );

  const getItem = (index: number): VirtualItem => {
    const start = starts[index] ?? 0;
    return { index, start, size: (starts[index + 1] ?? start) - start };
  };

  return { items, totalSize: (starts[count] ?? 0) + paddingEnd, scrollToIndex, measureElement, getItem };
}
