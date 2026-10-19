import * as React from "react";
import { tv } from "../../utils/tv";
import { useId } from "../../utils/use-id";
import { useCenngeDefaults } from "../../provider";
import type { CenngeColor, CenngeRadius, CenngeSize } from "../../types";

export type SnippetVariant = "solid" | "flat" | "bordered" | "faded";

/* Literal class strings, so Tailwind can find them. */
const colorVariants: Record<SnippetVariant, Record<CenngeColor, string>> = {
  solid: {
    default: "bg-default text-default-foreground",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-danger text-danger-foreground",
    info: "bg-info text-info-foreground",
  },
  flat: {
    default: "bg-default-bg text-foreground",
    primary: "bg-primary-bg text-primary-text",
    secondary: "bg-secondary-bg text-secondary-text",
    success: "bg-success-bg text-success-text",
    warning: "bg-warning-bg text-warning-text",
    danger: "bg-danger-bg text-danger-text",
    info: "bg-info-bg text-info-text",
  },
  bordered: {
    default: "inset-ring-border text-foreground",
    primary: "inset-ring-primary text-primary-text",
    secondary: "inset-ring-secondary text-secondary-text",
    success: "inset-ring-success text-success-text",
    warning: "inset-ring-warning text-warning-text",
    danger: "inset-ring-danger text-danger-text",
    info: "inset-ring-info text-info-text",
  },
  faded: {
    default: "text-foreground",
    primary: "text-primary-text",
    secondary: "text-secondary-text",
    success: "text-success-text",
    warning: "text-warning-text",
    danger: "text-danger-text",
    info: "text-info-text",
  },
};

const snippet = tv({
  slots: {
    base: "inline-flex max-w-full items-start gap-1 font-mono",
    pre: [
      "min-w-0 flex-1 overflow-x-auto rounded-small whitespace-pre",
      "[scrollbar-width:thin] outline-none focus-visible:outline-2 focus-visible:outline-current",
    ],
    line: "block",
    symbol: "mr-2 select-none",
    copyButton: [
      "flex shrink-0 cursor-pointer items-center justify-center rounded-small",
      "transition-[background-color,transform] duration-(--cennge-duration-fast) ease-tactile motion-reduce:transition-none",
      "hover:bg-current/10 active:scale-90",
      // The text colour stays visible on every variant, including solid fills in the accent colour.
      "outline-none focus-visible:outline-2 focus-visible:outline-current",
    ],
    copyIcon: "size-[1.15em] data-[copied]:animate-cennge-pop-in motion-reduce:animate-none",
  },
  variants: {
    variant: {
      solid: { base: "inset-shadow-tactile" },
      flat: {},
      // An inset ring instead of a border: every variant keeps the same size.
      bordered: { base: "bg-transparent inset-ring-2" },
      faded: { base: "bg-surface-2 inset-ring-2 inset-ring-border" },
    },
    color: { default: {}, primary: {}, secondary: {}, success: {}, warning: {}, danger: {}, info: {} },
    // The button's negative margin centres it on the first line; one line matches Input's height.
    size: {
      sm: { base: "py-1.5 pr-1 pl-2.5 text-xs", pre: "leading-5", copyButton: "-my-0.5 size-6" },
      md: { base: "py-2 pr-1.5 pl-3 text-sm", pre: "leading-6", copyButton: "-my-0.5 size-7" },
      lg: { base: "py-2.5 pr-2 pl-4 text-base", pre: "leading-7", copyButton: "-my-0.5 size-8" },
    },
    radius: {
      none: { base: "rounded-none" },
      sm: { base: "rounded-small" },
      md: { base: "rounded-medium" },
      lg: { base: "rounded-large" },
      full: { base: "rounded-full pl-4" },
    },
  },
  compoundVariants: (Object.keys(colorVariants) as SnippetVariant[]).flatMap((variant) =>
    (Object.keys(colorVariants[variant]) as CenngeColor[]).map((color) => ({
      variant,
      color,
      class: { base: colorVariants[variant][color] },
    })),
  ),
  defaultVariants: { variant: "flat", color: "default", size: "md", radius: "md" },
});

type SnippetSlots = "base" | "pre" | "symbol" | "copyButton";

export interface SnippetProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "children" | "onCopy"> {
  /** The command. A string with line breaks shows one row per line, each with its own symbol. */
  children?: React.ReactNode;
  /** Shown before every line; never copied or read out. `false` hides it. @default "$" */
  symbol?: React.ReactNode;
  /** Copied instead of the visible text. */
  codeString?: string;
  /** Called with the copied text. */
  onCopy?: (text: string) => void;
  /** How long the check mark stays after copying, ms. @default 2000 */
  timeout?: number;
  hideCopyButton?: boolean;
  /** Accessible name of the copy button. @default "Copy" */
  copyLabel?: string;
  /** Announced to screen readers after copying. @default "Copied" */
  copiedLabel?: string;
  /** @default "flat" */
  variant?: SnippetVariant;
  /** @default "default" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  /** @default "md" */
  radius?: CenngeRadius;
  classNames?: Partial<Record<SnippetSlots, string>>;
}

/*
 * navigator.clipboard exists only in secure contexts (https, localhost). Elsewhere, e.g. a dev
 * server opened over the local network, fall back to a selected textarea. The textarea goes next
 * to the button, so a focus trap around the snippet (a dialog) does not fight over focus.
 */
async function writeToClipboard(text: string, anchor: HTMLElement): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Denied or unavailable: try the fallback.
    }
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.setAttribute("aria-hidden", "true");
  area.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none";
  anchor.after(area);
  area.focus({ preventScroll: true });
  area.select();
  area.setSelectionRange(0, text.length);
  const copied = document.execCommand("copy");
  area.remove();
  anchor.focus();
  if (!copied) throw new Error("Copying is not allowed here");
}

function CopyIcon(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
      <path d="M15.5 5.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8.5a2 2 0 0 0 2 2h.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A command or short code with a copy button. */
export const Snippet = React.forwardRef<HTMLDivElement, SnippetProps>(function Snippet(props, ref) {
  const defaults = useCenngeDefaults();
  const {
    children,
    symbol = "$",
    codeString,
    onCopy,
    timeout = 2000,
    hideCopyButton = false,
    copyLabel = "Copy",
    copiedLabel = "Copied",
    variant = "flat",
    color = "default",
    size = defaults.size ?? "md",
    radius = defaults.radius ?? "md",
    className,
    classNames,
    ...rest
  } = props;

  const codeId = useId();
  const codeRef = React.useRef<HTMLElement>(null);
  const preRef = React.useRef<HTMLPreElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = React.useState(false);
  const [isScrollable, setScrollable] = React.useState(false);

  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);

  // A long command scrolls sideways; keyboard users can then focus it and scroll with the arrows.
  React.useEffect(() => {
    const pre = preRef.current;
    if (!pre || typeof ResizeObserver === "undefined") return;
    const check = () => setScrollable(pre.scrollWidth > pre.clientWidth + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(pre);
    return () => observer.disconnect();
  }, [children]);

  const lines = typeof children === "string" ? children.replace(/\n$/, "").split("\n") : [children];

  const handleCopy = async () => {
    const button = buttonRef.current;
    if (!button) return;
    const text =
      codeString ??
      Array.from(codeRef.current?.querySelectorAll("[data-snippet-text]") ?? [], (node) => node.textContent ?? "").join(
        "\n",
      );
    try {
      await writeToClipboard(text, button);
    } catch {
      return;
    }
    if (!mounted.current) return;
    setCopied(true);
    onCopy?.(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), timeout);
  };

  const slots = snippet({ variant, color, size, radius });
  const Icon = copied ? CheckIcon : CopyIcon;

  return (
    <div ref={ref} className={slots.base({ class: [classNames?.base, className] })} {...rest}>
      <pre
        ref={preRef}
        tabIndex={isScrollable ? 0 : undefined}
        className={slots.pre({ class: classNames?.pre })}
      >
        <code ref={codeRef} id={codeId}>
          {lines.map((line, index) => (
            <span key={index} className={slots.line()}>
              {symbol === false || symbol === null || symbol === "" ? null : (
                <span aria-hidden="true" className={slots.symbol({ class: classNames?.symbol })}>
                  {symbol}
                </span>
              )}
              <span data-snippet-text="">{line}</span>
            </span>
          ))}
        </code>
      </pre>
      {hideCopyButton ? null : (
        <button
          ref={buttonRef}
          type="button"
          aria-label={copyLabel}
          aria-describedby={codeId}
          data-copied={copied || undefined}
          onClick={handleCopy}
          className={slots.copyButton({ class: classNames?.copyButton })}
        >
          <Icon key={copied ? "check" : "copy"} data-copied={copied || undefined} className={slots.copyIcon()} />
        </button>
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </div>
  );
});
