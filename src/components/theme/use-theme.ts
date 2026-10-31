import * as React from "react";
import { applyTheme, defaultStorageKey, readTheme, themeChangeEvent, type Theme, type ThemeOptions } from "./script";

/*
 * React.useSyncExternalStore exists from React 18. Read it through a computed key so bundlers do not
 * flag a missing export when the app runs React 17 (as in use-id.ts).
 */
const useSyncExternalStore = (React as Record<string, unknown>)["useSyncExternalStore".toString()] as
  | (<T>(subscribe: (onChange: () => void) => () => void, getSnapshot: () => T, getServerSnapshot: () => T) => T)
  | undefined;

/** Hears every change: this page's setTheme, another tab's, the system's, and the class set by hand. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener(themeChangeEvent, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    observer.disconnect();
    window.removeEventListener(themeChangeEvent, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const serverSnapshot = () => undefined;

/** React 17: undefined in the first render, as on the server; read from the page right after. */
function useStoreFallback<T>(getSnapshot: () => T): T | undefined {
  const [value, setValue] = React.useState<T | undefined>(undefined);
  React.useEffect(() => {
    const read = () => setValue(getSnapshot);
    read();
    return subscribe(read);
  }, [getSnapshot]);
  return value;
}

function useStore<T>(getSnapshot: () => T): T | undefined {
  return useSyncExternalStore ? useSyncExternalStore<T | undefined>(subscribe, getSnapshot, serverSnapshot) : useStoreFallback(getSnapshot);
}

/** Choices made where storage is blocked (a sandboxed frame): kept for the page's life instead. */
const unstored = new Map<string, Theme>();

export interface UseThemeResult {
  /** What was chosen: "light", "dark" or "system". Undefined on the server and while the page hydrates. */
  theme: Theme | undefined;
  /** What is shown, with "system" resolved. Undefined on the server and while the page hydrates. */
  resolvedTheme: "light" | "dark" | undefined;
  /** Remembers the choice in localStorage and shows it at once, in every tab. */
  setTheme: (theme: Theme) => void;
}

/**
 * The page's theme, safe to render with: undefined until the page has hydrated, because the server cannot
 * know it, so nothing differs between the server's HTML and the first render (no hydration error). Show
 * icons that depend on it with CSS (`dark:hidden`) instead, as ThemeSwitch does. Pair with ThemeScript
 * and the same options.
 */
export function useTheme(options: ThemeOptions = {}): UseThemeResult {
  const { storageKey = defaultStorageKey, defaultTheme } = options;
  const getTheme = React.useCallback(
    () => unstored.get(storageKey) ?? readTheme({ storageKey, defaultTheme }),
    [storageKey, defaultTheme],
  );
  const theme = useStore(getTheme);
  const resolvedTheme = useStore(resolvedSnapshot);
  const setTheme = React.useCallback(
    (next: Theme) => {
      try {
        window.localStorage.setItem(storageKey, next);
        applyTheme({ storageKey, defaultTheme });
      } catch {
        // Storage blocked: the page still switches, it just will not remember after a reload.
        unstored.set(storageKey, next);
        applyTheme({ storageKey, defaultTheme: next });
      }
      window.dispatchEvent(new Event(themeChangeEvent));
    },
    [storageKey, defaultTheme],
  );
  return { theme, resolvedTheme, setTheme };
}

function resolvedSnapshot(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
