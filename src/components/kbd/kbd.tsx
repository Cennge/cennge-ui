import * as React from "react";
import { cn } from "../../utils/cn";

const keyMap = {
  command: { symbol: "⌘", label: "Command" },
  shift: { symbol: "⇧", label: "Shift" },
  option: { symbol: "⌥", label: "Option" },
  ctrl: { symbol: "Ctrl", label: "Control" },
  alt: { symbol: "Alt", label: "Alt" },
  enter: { symbol: "↵", label: "Enter" },
  escape: { symbol: "Esc", label: "Escape" },
  tab: { symbol: "⇥", label: "Tab" },
  backspace: { symbol: "⌫", label: "Backspace" },
  delete: { symbol: "⌦", label: "Delete" },
  space: { symbol: "Space", label: "Space" },
  up: { symbol: "↑", label: "Arrow up" },
  down: { symbol: "↓", label: "Arrow down" },
  left: { symbol: "←", label: "Arrow left" },
  right: { symbol: "→", label: "Arrow right" },
} as const;

export type KbdKey = keyof typeof keyMap;

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  /** Named keys rendered as symbols, each with its full name for screen readers. Combined with children. */
  keys?: KbdKey | KbdKey[];
  /** @default "md" */
  size?: "sm" | "md";
}

/** A keyboard key or shortcut: `<Kbd keys="command">K</Kbd>`. */
export const Kbd = React.forwardRef<HTMLElement, KbdProps>(function Kbd(
  { keys, size = "md", className, children, ...rest },
  ref,
) {
  const list = keys === undefined ? [] : Array.isArray(keys) ? keys : [keys];
  return (
    <kbd
      ref={ref}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-0.5 rounded-[0.375rem] border border-border bg-surface-3",
        "font-sans font-medium whitespace-nowrap text-muted",
        // The key cap: a darker bottom edge, like a physical key.
        "inset-shadow-[inset_0_-1.5px_0_var(--cennge-border)]",
        size === "sm" ? "h-5 min-w-5 px-1 text-[11px]" : "h-6 min-w-6 px-1.5 text-xs",
        className,
      )}
      {...rest}
    >
      {list.map((key) => (
        <abbr key={key} title={keyMap[key].label} className="no-underline">
          {keyMap[key].symbol}
        </abbr>
      ))}
      {children}
    </kbd>
  );
});
