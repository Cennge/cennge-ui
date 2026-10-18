import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";
import { tv } from "../../utils/tv";
import { useId } from "../../utils/use-id";
import type { CenngeColor, CenngeSize } from "../../types";

const progress = tv({
  slots: {
    base: "flex w-full flex-col gap-2",
    header: "flex items-center justify-between gap-3 text-sm",
    label: "font-medium text-foreground",
    value: "text-muted tabular-nums",
    track: "relative w-full overflow-hidden rounded-full bg-surface-4 inset-shadow-[inset_0_1px_2px_rgb(0_0_0/0.25)]",
    indicator: [
      "h-full rounded-full transition-[width] duration-500 ease-tactile motion-reduce:transition-none",
      "data-[state=indeterminate]:w-2/5 data-[state=indeterminate]:animate-cennge-progress",
      "motion-reduce:data-[state=indeterminate]:animate-none motion-reduce:data-[state=indeterminate]:w-full motion-reduce:data-[state=indeterminate]:opacity-50",
    ],
  },
  variants: {
    size: {
      sm: { track: "h-1" },
      md: { track: "h-2" },
      lg: { track: "h-3" },
    },
    color: {
      default: { indicator: "bg-default-500" },
      primary: { indicator: "bg-primary" },
      secondary: { indicator: "bg-secondary" },
      success: { indicator: "bg-success" },
      warning: { indicator: "bg-warning" },
      danger: { indicator: "bg-danger" },
      info: { indicator: "bg-info" },
    },
  },
  defaultVariants: { size: "md", color: "primary" },
});

export interface ProgressProps {
  /** Omit (or pass null) for an indeterminate bar. */
  value?: number | null;
  /** @default 100 */
  max?: number;
  label?: React.ReactNode;
  /** @default true when there is a label and a value */
  showValue?: boolean;
  /** @default (v, max) => `${Math.round((v / max) * 100)}%` */
  formatValue?: (value: number, max: number) => string;
  /** @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  className?: string;
  "aria-label"?: string;
}

const percent = (value: number, max: number) => `${Math.round((value / max) * 100)}%`;

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value = null, max = 100, label, showValue, formatValue = percent, color = "primary", size = "md", className, "aria-label": ariaLabel },
  ref,
) {
  const id = useId();
  const slots = progress({ color, size });
  const clamped = value === null ? null : Math.min(Math.max(value, 0), max);
  const labelId = id ? `${id}-label` : undefined;

  return (
    <div className={slots.base({ class: className })}>
      {label ? (
        <div className={slots.header()}>
          <span id={labelId} className={slots.label()}>
            {label}
          </span>
          {(showValue ?? clamped !== null) && clamped !== null ? (
            <span className={slots.value()}>{formatValue(clamped, max)}</span>
          ) : null}
        </div>
      ) : null}
      <ProgressPrimitive.Root
        ref={ref}
        value={clamped}
        max={max}
        getValueLabel={(v, m) => formatValue(v, m)}
        aria-label={ariaLabel}
        aria-labelledby={label && !ariaLabel ? labelId : undefined}
        className={slots.track()}
      >
        <ProgressPrimitive.Indicator
          className={slots.indicator()}
          style={clamped === null ? undefined : { width: `${(clamped / max) * 100}%` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
});
