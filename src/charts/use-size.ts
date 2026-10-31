import * as React from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface Size {
  width: number;
  height: number;
}

/**
 * An element's layout size in pixels, kept up to date; null on the server and until it is measured. The
 * layout size, not the box on screen: a dialog's opening scale must not shrink what is drawn in it.
 */
export function useSize<T extends HTMLElement>(): [React.RefCallback<T>, Size | null] {
  const [node, setNode] = React.useState<T | null>(null);
  const [size, setSize] = React.useState<Size | null>(null);
  useIsomorphicLayoutEffect(() => {
    if (!node) return;
    const measure = () => {
      const next = { width: node.clientWidth, height: node.clientHeight };
      setSize((previous) => (previous && previous.width === next.width && previous.height === next.height ? previous : next));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);
  return [setNode, size];
}
