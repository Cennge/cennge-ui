import * as React from "react";
import { cn } from "../../utils/cn";

/*
 * Keys shown as a symbol are drawn, not typed: in Inter, ⌘ ⇧ ↵ and the arrows sit at the height of a
 * lowercase letter, about 5px in a 12px key cap, and fonts without them draw them however they like. As
 * 24 × 24 strokes they fill the cap the same way everywhere.
 */
const icons = {
  command: "M9 9V6a3 3 0 1 0-3 3h3Zm6 0V6a3 3 0 1 1 3 3h-3Zm0 6v3a3 3 0 1 0 3-3h-3Zm-6 0v3a3 3 0 1 1-3-3h3ZM9 9h6v6H9Z",
  shift: "M12 3.5 20 12h-4.5v8h-7v-8H4Z",
  option: "M3 7h5.5l7 10H21M14.5 7H21",
  enter: "M19 5v6a3 3 0 0 1-3 3H5m4.5-4.5L5 14l4.5 4.5",
  tab: "M3 12h15m-4.5-4.5L18 12l-4.5 4.5M21 6v12",
  backspace: "M8.5 5H20a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H8.5L2.5 12Zm2.5 4.5 5 5m0-5-5 5",
  delete: "M15.5 5H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h11.5l6-7ZM8 9.5l5 5m0-5-5 5",
  up: "M12 19V5m-6.5 6.5L12 5l6.5 6.5",
  down: "M12 5v14m6.5-6.5L12 19l-6.5-6.5",
  left: "M19 12H5m6.5-6.5L5 12l6.5 6.5",
  right: "M5 12h14m-6.5-6.5L19 12l-6.5 6.5",
} as const;

const keyMap = {
  command: "Command",
  shift: "Shift",
  option: "Option",
  ctrl: "Control",
  alt: "Alt",
  enter: "Enter",
  escape: "Escape",
  tab: "Tab",
  backspace: "Backspace",
  delete: "Delete",
  space: "Space",
  up: "Arrow up",
  down: "Arrow down",
  left: "Arrow left",
  right: "Arrow right",
} as const;

/** Keys written out rather than drawn. */
const words: Partial<Record<keyof typeof keyMap, string>> = { ctrl: "Ctrl", alt: "Alt", escape: "Esc", space: "Space" };

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
      {list.map((key) => {
        const word = words[key];
        return (
          // The title names the key on hover; a drawn key also carries its name in text, for screen readers.
          <abbr key={key} title={keyMap[key]} className="inline-flex items-center no-underline">
            {word ?? (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.25}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className={size === "sm" ? "size-3" : "size-3.5"}
                >
                  <path d={icons[key as keyof typeof icons]} />
                </svg>
                {/* With a space after it, so a shortcut reads "Command Shift K", not one word. */}
                <span className="sr-only">{`${keyMap[key]} `}</span>
              </>
            )}
          </abbr>
        );
      })}
      {children}
    </kbd>
  );
});
