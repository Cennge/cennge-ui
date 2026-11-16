import * as React from "react";

/*
 * The bottom of the screen, shared by what is fixed to it: a BottomNavigation, a BottomBar above it, a
 * floating action button above both. Each fixed one writes its height on <html>, and the others place
 * themselves on top of it:
 *
 *   --cennge-bottom-nav   the BottomNavigation's height, its safe-area padding included
 *   --cennge-bottom-bar   the BottomBar's height
 *   --cennge-bottom-safe  0px while a BottomNavigation takes the safe area, so nothing pads for it twice
 *
 * Use them for your own layout too: `pb-[var(--cennge-bottom-nav,0px)]` keeps a page's end clear.
 */
export type BottomStackPart = "nav" | "bar";

/** Who writes each variable, in the order they mounted: the latest one still mounted is the one shown. */
const writers: Record<BottomStackPart, Map<object, () => void>> = { nav: new Map(), bar: new Map() };

const useIsomorphicLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/** Writes the element's height on <html> as --cennge-bottom-<part> while it is mounted and `isFixed`. */
export function useBottomStack<T extends HTMLElement>(part: BottomStackPart, ref: React.RefObject<T | null>, isFixed: boolean) {
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!isFixed || !element) return;
    const root = document.documentElement;
    const token = {};
    const write = () => {
      // Only the latest of several (two screens mounted during a transition) sets the height.
      if ([...writers[part].keys()].at(-1) !== token) return;
      root.style.setProperty(`--cennge-bottom-${part}`, `${element.offsetHeight}px`);
      if (part === "nav") root.style.setProperty("--cennge-bottom-safe", "0px");
    };
    writers[part].set(token, write);
    write();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(write);
    observer?.observe(element);
    return () => {
      observer?.disconnect();
      writers[part].delete(token);
      const latest = [...writers[part].values()].at(-1);
      if (latest) return latest();
      root.style.removeProperty(`--cennge-bottom-${part}`);
      if (part === "nav") root.style.removeProperty("--cennge-bottom-safe");
    };
  }, [part, ref, isFixed]);
}

/** The safe area at the bottom of the screen, unless a BottomNavigation already pads for it. */
export const bottomSafe = "var(--cennge-bottom-safe, env(safe-area-inset-bottom, 0px))";
