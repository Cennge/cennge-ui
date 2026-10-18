import * as React from "react";
import { tv } from "../../utils/tv";
import type { CenngeColor, CenngeSize } from "../../types";

export type IndicatorPlacement = "top-right" | "top-left" | "bottom-right" | "bottom-left";

const indicator = tv({
  base: [
    "pointer-events-none absolute z-10 inline-flex items-center justify-center rounded-full font-semibold tabular-nums",
    "transition-transform duration-(--cennge-duration) ease-tactile motion-reduce:transition-none",
    "data-[invisible]:scale-0",
  ],
  variants: {
    color: {
      default: "bg-default-500 text-white",
      primary: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      success: "bg-success text-success-foreground",
      warning: "bg-warning text-warning-foreground",
      danger: "bg-danger text-danger-foreground",
      info: "bg-info text-info-foreground",
    },
    isDot: { true: "", false: "" },
    size: { sm: "", md: "", lg: "" },
    // Separates the indicator from the element under it. Override the colour with ring-* if the
    // indicator sits on something other than the page background.
    showOutline: { true: "ring-2 ring-background" },
    placement: {
      "top-right": "top-0 right-0 translate-x-1/2 -translate-y-1/2",
      "top-left": "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
      "bottom-right": "right-0 bottom-0 translate-x-1/2 translate-y-1/2",
      "bottom-left": "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
    },
    shape: {
      rectangle: "",
      // On a round anchor the corner is empty space; move the indicator onto the edge.
      circle: "",
    },
  },
  compoundVariants: [
    { isDot: true, size: "sm", class: "size-2" },
    { isDot: true, size: "md", class: "size-2.5" },
    { isDot: true, size: "lg", class: "size-3" },
    { isDot: false, size: "sm", class: "h-4 min-w-4 px-1 text-[10px]" },
    { isDot: false, size: "md", class: "h-5 min-w-5 px-1.5 text-[11px]" },
    { isDot: false, size: "lg", class: "h-6 min-w-6 px-1.5 text-xs" },
    { shape: "circle", placement: "top-right", class: "top-[14%] right-[14%]" },
    { shape: "circle", placement: "top-left", class: "top-[14%] left-[14%]" },
    { shape: "circle", placement: "bottom-right", class: "right-[14%] bottom-[14%]" },
    { shape: "circle", placement: "bottom-left", class: "bottom-[14%] left-[14%]" },
  ],
});

export interface IndicatorProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "content" | "color"> {
  /** The element the indicator sits on: an Avatar, an icon Button. */
  children: React.ReactNode;
  /** A count or short text. Omit for a plain dot. */
  content?: React.ReactNode;
  /** Numbers above this show as "99+". @default 99 */
  max?: number;
  /** @default "danger" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  /** @default "top-right" */
  placement?: IndicatorPlacement;
  /** Use "circle" on round anchors such as avatars. @default "rectangle" */
  shape?: "rectangle" | "circle";
  /** Hide with a scale animation, e.g. when the count drops to zero. */
  isInvisible?: boolean;
  /** @default true */
  showOutline?: boolean;
  /**
   * What the indicator means, for screen readers: "3 unread messages", "Online".
   * Without it the indicator is decorative.
   */
  label?: string;
}

export const Indicator = React.forwardRef<HTMLSpanElement, IndicatorProps>(function Indicator(
  {
    children,
    content,
    max = 99,
    color = "danger",
    size = "md",
    placement = "top-right",
    shape = "rectangle",
    isInvisible = false,
    showOutline = true,
    label,
    className,
    ...rest
  },
  ref,
) {
  const isDot = content === undefined || content === null || content === "";
  const shown = typeof content === "number" && content > max ? `${max}+` : content;

  return (
    <span ref={ref} className="relative inline-flex shrink-0" {...rest}>
      {children}
      <span
        data-invisible={isInvisible || undefined}
        aria-hidden={label ? undefined : true}
        className={indicator({ color, size, placement, shape, isDot, showOutline, className })}
      >
        {isDot ? null : <span aria-hidden={label ? true : undefined}>{shown}</span>}
        {label && !isInvisible ? <span className="sr-only">{label}</span> : null}
      </span>
    </span>
  );
});
