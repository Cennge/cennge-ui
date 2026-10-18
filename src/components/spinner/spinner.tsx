import * as React from "react";
import { tv } from "../../utils/tv";
import type { CenngeColor, CenngeSize } from "../../types";

const spinner = tv({
  base: "inline-block shrink-0 animate-spin motion-reduce:animate-[spin_1.5s_linear_infinite]",
  variants: {
    size: { sm: "size-3.5", md: "size-4", lg: "size-5" },
    color: {
      current: "",
      default: "text-muted",
      primary: "text-primary",
      secondary: "text-secondary",
      success: "text-success",
      warning: "text-warning",
      danger: "text-danger",
      info: "text-info",
    },
  },
  defaultVariants: { size: "md", color: "current" },
});

export interface SpinnerProps extends Omit<React.SVGAttributes<SVGSVGElement>, "color"> {
  /** @default "md" */
  size?: CenngeSize;
  /** `"current"` inherits the text colour. @default "current" */
  color?: CenngeColor | "current";
  /** Announced to screen readers. Omit when the spinner sits inside a labelled element. */
  label?: string;
}

export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(function Spinner(
  { size = "md", color = "current", label, className, ...rest },
  ref,
) {
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={spinner({ size, color, className })}
      {...rest}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
});
