import * as React from "react";

/*
 * React.useId exists from React 18. Read it through a computed key so bundlers do not
 * flag a missing export when the app runs React 17.
 */
const useReactId: (() => string) | undefined = (React as Record<string, unknown>)[
  "useId".toString()
] as (() => string) | undefined;

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

let counter = 0;

/** React 17 fallback: no id during SSR, a stable one right after mount. Avoids hydration mismatches. */
function useFallbackId(): string | undefined {
  const [id, setId] = React.useState<string | undefined>(undefined);
  useIsomorphicLayoutEffect(() => {
    setId((current) => current ?? String(++counter));
  }, []);
  return id;
}

/** Stable unique id for wiring labels and descriptions. Prefer `idProp` when given. */
export function useId(idProp?: string): string | undefined {
  const generated = (useReactId ?? useFallbackId)();
  if (idProp) return idProp;
  return generated === undefined ? undefined : `cennge-${generated.replace(/:/g, "")}`;
}
