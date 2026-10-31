import * as React from "react";
import type { CenngeSize } from "../../types";
import { ToggleGroup, ToggleGroupItem } from "../toggle-group";
import { themeScript, type Theme, type ThemeOptions } from "./script";
import { useTheme } from "./use-theme";

export interface ThemeScriptProps extends ThemeOptions {
  /** For a Content-Security-Policy that allows inline scripts by nonce. */
  nonce?: string;
}

/**
 * Shows the stored theme before the page paints, so a dark page never flashes white, and keeps it in
 * step with the system and other tabs. Put it in the <head> (in Next.js, the root layout), with the same
 * options as useTheme. It sets the class on <html> before React hydrates: give <html>
 * `suppressHydrationWarning`, which covers that element's own attributes only.
 */
export function ThemeScript({ nonce, ...options }: ThemeScriptProps) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript(options) }} />;
}

export interface ThemeSwitchLabels {
  group: string;
  light: string;
  dark: string;
  system: string;
}

export const defaultThemeSwitchLabels: ThemeSwitchLabels = { group: "Theme", light: "Light", dark: "Dark", system: "System" };

export interface ThemeSwitchProps extends ThemeOptions {
  /** @default "sm" */
  size?: CenngeSize;
  /** Names for screen readers, in your language. */
  labels?: Partial<ThemeSwitchLabels>;
  className?: string;
}

const icon = { viewBox: "0 0 24 24", className: "size-4", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

/**
 * Light, dark, or as the system says. Nothing is selected until the page has hydrated: the server cannot
 * know the choice, and the first render must match its HTML.
 */
export function ThemeSwitch({ storageKey, defaultTheme, size = "sm", labels, className }: ThemeSwitchProps) {
  const { theme, setTheme } = useTheme({ storageKey, defaultTheme });
  const text = { ...defaultThemeSwitchLabels, ...labels };
  return (
    <ToggleGroup
      aria-label={text.group}
      size={size}
      value={theme ?? null}
      onValueChange={(next) => {
        if (next) setTheme(next as Theme);
      }}
      className={className}
    >
      <ToggleGroupItem value="light" isIconOnly aria-label={text.light}>
        <svg {...icon}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" isIconOnly aria-label={text.dark}>
        <svg {...icon}>
          <path d="M20.5 14.1A8.5 8.5 0 1 1 9.9 3.5a6.6 6.6 0 0 0 10.6 10.6Z" />
        </svg>
      </ToggleGroupItem>
      <ToggleGroupItem value="system" isIconOnly aria-label={text.system}>
        <svg {...icon}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </svg>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
