import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "../../utils/cn";
import { tv } from "../../utils/tv";
import { useBottomStack } from "../../utils/use-bottom-stack";

const navigation = tv({
  slots: {
    // --cennge-nav-bg is the bar's colour, also the ring around its badges: set it to restyle the bar.
    base: "z-40 w-full border-t border-border bg-(--cennge-nav-bg) backdrop-blur-md [--cennge-nav-bg:color-mix(in_oklab,var(--cennge-surface-2)_95%,transparent)]",
    list: "mx-auto flex max-w-xl items-stretch",
  },
  variants: {
    position: {
      fixed: { base: "fixed inset-x-0 bottom-0" },
      sticky: { base: "sticky bottom-0" },
      static: { base: "relative" },
    },
  },
});

const item = tv({
  slots: {
    base: [
      "group relative flex min-h-16 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1 px-1 pt-2 pb-1.5",
      "text-xs leading-4 font-medium text-muted select-none outline-none [-webkit-tap-highlight-color:transparent]",
      "transition-colors duration-(--cennge-duration-fast) hover:text-foreground",
      "data-[active]:text-foreground",
      "focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-solid focus-visible:outline-ring",
      "aria-disabled:pointer-events-none aria-disabled:opacity-(--cennge-disabled-opacity)",
    ],
    // The pill behind the icon: where you are, at a glance, and the press target that answers a tap.
    indicator: [
      "relative flex h-8 w-14 items-center justify-center rounded-full [&_svg]:size-6",
      "transition-[background-color,transform] duration-(--cennge-duration) ease-tactile motion-reduce:transition-none",
      "group-hover:bg-default-500/10 group-active:scale-95 group-data-[active]:bg-primary-bg group-data-[active]:text-primary-text",
      "forced-colors:group-data-[active]:outline forced-colors:group-data-[active]:outline-1",
    ],
    label: "max-w-full truncate",
    badge: [
      "absolute top-1 left-[calc(50%+0.375rem)] flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1",
      "text-[10px] leading-none font-semibold text-danger-foreground tabular-nums ring-2 ring-(--cennge-nav-bg,var(--cennge-surface-2))",
    ],
    dot: "absolute top-0.5 left-[calc(50%+0.625rem)] size-2 rounded-full bg-danger ring-2 ring-(--cennge-nav-bg,var(--cennge-surface-2))",
  },
});

export interface BottomNavigationProps extends React.HTMLAttributes<HTMLElement> {
  /** Names the navigation for screen readers, e.g. "Main". */
  "aria-label": string;
  /**
   * "fixed" pins it to the bottom of the screen and tells a BottomBar and a FloatingActionButton to sit
   * above it; "sticky" keeps it at the bottom of its scroll container; "static" leaves it in the flow.
   * @default "fixed"
   */
  position?: "fixed" | "sticky" | "static";
  classNames?: Partial<Record<"base" | "list", string>>;
}

/**
 * Three to five top-level places of an app on a phone, in a bar at the bottom of the screen, each an
 * icon over a short label. It pads for the home indicator (`viewport-fit=cover` in your viewport meta) and
 * writes its height to `--cennge-bottom-nav` on `<html>`, for your page's last line to clear it.
 */
export const BottomNavigation = React.forwardRef<HTMLElement, BottomNavigationProps>(function BottomNavigation(
  { position = "fixed", className, classNames, style, children, ...rest },
  forwardedRef,
) {
  const ref = React.useRef<HTMLElement>(null);
  React.useImperativeHandle(forwardedRef, () => ref.current as HTMLElement);
  useBottomStack("nav", ref, position === "fixed");
  const slots = navigation({ position });
  return (
    <nav
      ref={ref}
      data-slot="bottom-navigation"
      className={slots.base({ class: [classNames?.base, className] })}
      style={{ paddingBottom: position === "static" ? undefined : "env(safe-area-inset-bottom, 0px)", ...style }}
      {...rest}
    >
      <ul className={slots.list({ class: classNames?.list })}>{children}</ul>
    </nav>
  );
});

export interface BottomNavigationItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** A 24px icon. */
  icon: React.ReactNode;
  /** One or two short words: "Today", "Log", "Progress". */
  label: string;
  /** The place you are in: highlighted, and `aria-current="page"`. */
  isActive?: boolean;
  /** A count on the icon (99+ past 99), or `true` for a dot. Screen readers hear it after the label: "Log 3", "Profile new". */
  badge?: number | boolean;
  /** What a dot means, read after the label. @default "new" */
  badgeLabel?: string;
  isDisabled?: boolean;
  /** Render your link (a Next.js Link, an <a>) as the item; give it no children of its own. */
  asChild?: boolean;
  /** The element passed through `asChild`. */
  children?: React.ReactElement;
  classNames?: Partial<Record<"base" | "indicator" | "label" | "badge" | "dot", string>>;
}

const blockClick = (event: React.MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

/** One place in a BottomNavigation: a link (through `asChild`) or a button. */
export const BottomNavigationItem = React.forwardRef<HTMLButtonElement, BottomNavigationItemProps>(function BottomNavigationItem(
  { icon, label, isActive = false, badge, badgeLabel = "new", isDisabled = false, asChild = false, className, classNames, onClickCapture, children, ...rest },
  ref,
) {
  const slots = item();
  const Comp = asChild ? Slot.Root : "button";
  const count = typeof badge === "number" && badge > 0 ? (badge > 99 ? "99+" : String(badge)) : null;
  const content = (
    <>
      <span aria-hidden="true" className={slots.indicator({ class: classNames?.indicator })}>
        {icon}
        {badge === true ? <span className={slots.dot({ class: classNames?.dot })} /> : null}
      </span>
      <span className={slots.label({ class: classNames?.label })}>{label}</span>
      {/* After the label, drawn on the icon: its name reads as it shows, "Log 3". */}
      {count ? <span className={slots.badge({ class: classNames?.badge })}>{count}</span> : null}
      {badge === true ? <span className="sr-only">{badgeLabel}</span> : null}
    </>
  );
  return (
    <li className="flex min-w-0 flex-1">
      <Comp
        ref={ref}
        type={asChild ? undefined : "button"}
        aria-current={isActive ? "page" : undefined}
        aria-disabled={isDisabled || undefined}
        disabled={asChild ? undefined : isDisabled}
        data-active={isActive ? "" : undefined}
        data-slot="bottom-navigation-item"
        className={cn(slots.base({ class: classNames?.base }), className)}
        // A link cannot be disabled: its clicks, by tap or by Enter, are stopped instead.
        onClickCapture={asChild && isDisabled ? blockClick : onClickCapture}
        {...rest}
      >
        {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : null}
        {content}
      </Comp>
    </li>
  );
});

