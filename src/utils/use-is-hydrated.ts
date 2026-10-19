import * as React from "react";

/*
 * React.useSyncExternalStore exists from React 18. Read it through a computed key so bundlers do not
 * flag a missing export when the app runs React 17 (as in use-id.ts).
 */
const useSyncExternalStore = (React as Record<string, unknown>)["useSyncExternalStore".toString()] as
  | ((subscribe: (onChange: () => void) => () => void, getSnapshot: () => boolean, getServerSnapshot: () => boolean) => boolean)
  | undefined;

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const subscribe = () => () => {};

/** React 17: false in a component's first render, as on the server; true right after, before the paint. */
function useIsHydratedFallback(): boolean {
  const [isHydrated, setIsHydrated] = React.useState(false);
  useIsomorphicLayoutEffect(() => setIsHydrated(true), []);
  return isHydrated;
}

/**
 * False on the server and while React hydrates the server's HTML; true in every other render, including
 * the first one of a component mounted later (on React 17: from its second, before the browser paints).
 * Gates what only the browser knows, such as today's date in the user's time zone: rendered during
 * hydration, it would not match the HTML.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore ? useSyncExternalStore(subscribe, () => true, () => false) : useIsHydratedFallback();
}
