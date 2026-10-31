export type Theme = "light" | "dark" | "system";

export interface ThemeOptions {
  /** Where the choice is kept in localStorage. @default "cennge-theme" */
  storageKey?: string;
  /** Before anything is chosen. @default "system" */
  defaultTheme?: Theme;
}

export const defaultStorageKey = "cennge-theme";

/** Fired on window when setTheme changes the choice, so every useTheme in the page hears of it. */
export const themeChangeEvent = "cennge-theme-change";

/**
 * Reads the stored choice and puts the `dark` class on <html> to match, then keeps it matching as the
 * system changes and as other tabs choose. As a string, it runs in the page's <head> before the first
 * paint (ThemeScript); as a function, it is what setTheme runs. So it must not use anything from outside
 * itself, and is written for old engines: no arrow functions, nothing that throws where storage is blocked.
 */
function apply(storageKey: string, defaultTheme: Theme, watch: boolean) {
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var read = function () {
    var stored = null;
    try {
      stored = window.localStorage.getItem(storageKey);
    } catch (error) {
      // Storage blocked (a private window, a sandboxed frame): the default it is.
    }
    return stored === "light" || stored === "dark" || stored === "system" ? stored : defaultTheme;
  };
  var update = function () {
    var theme = read();
    root.classList.toggle("dark", theme === "dark" || (theme === "system" && media !== null && media.matches));
  };
  update();
  if (!watch) return;
  if (media) {
    media.addEventListener("change", function () {
      if (read() === "system") update();
    });
  }
  window.addEventListener("storage", function (event) {
    if (event.key === storageKey || event.key === null) update();
  });
}

/** The <head> script for these options: the stored theme is on <html> before the page paints. */
export function themeScript({ storageKey = defaultStorageKey, defaultTheme = "system" }: ThemeOptions = {}): string {
  return `(${apply.toString()})(${JSON.stringify(storageKey)},${JSON.stringify(defaultTheme)},true)`;
}

/**
 * For an app without server rendering: shows the stored theme and keeps it in step, as ThemeScript does
 * in a server-rendered page. Call it once, before the first render.
 */
export function initTheme({ storageKey = defaultStorageKey, defaultTheme = "system" }: ThemeOptions = {}) {
  apply(storageKey, defaultTheme, true);
}

/** Puts the stored choice on <html> now, without watching (the head script already does). */
export function applyTheme({ storageKey = defaultStorageKey, defaultTheme = "system" }: ThemeOptions = {}) {
  apply(storageKey, defaultTheme, false);
}

/** The stored choice, or the default. */
export function readTheme({ storageKey = defaultStorageKey, defaultTheme = "system" }: ThemeOptions = {}): Theme {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // As in apply().
  }
  return defaultTheme;
}
