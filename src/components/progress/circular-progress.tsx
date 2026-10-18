import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";
import { tv } from "../../utils/tv";
import { useId } from "../../utils/use-id";
import type { CenngeColor } from "../../types";

export type CircularProgressSize = "sm" | "md" | "lg" | "xl";

const dimensions: Record<CircularProgressSize, { box: number; stroke: number; text: string }> = {
  sm: { box: 32, stroke: 3, text: "text-[9px]" },
  md: { box: 48, stroke: 4, text: "text-[11px]" },
  lg: { box: 64, stroke: 5, text: "text-sm" },
  xl: { box: 96, stroke: 7, text: "text-lg" },
};

const circular = tv({
  slots: {
    base: "inline-flex flex-col items-center gap-2",
    svgWrapper: "relative inline-flex items-center justify-center",
    track: "stroke-surface-4",
    indicator: [
      "transition-[stroke-dashoffset] duration-500 ease-tactile motion-reduce:transition-none",
    ],
    value: "absolute font-semibold text-foreground tabular-nums",
    label: "text-sm font-medium text-foreground",
  },
  variants: {
    color: {
      default: { indicator: "stroke-default-500" },
      primary: { indicator: "stroke-primary" },
      secondary: { indicator: "stroke-secondary" },
      success: { indicator: "stroke-success" },
      warning: { indicator: "stroke-warning" },
      danger: { indicator: "stroke-danger" },
      info: { indicator: "stroke-info" },
    },
  },
});

export interface CircularProgressProps {
  /** Omit (or pass null) for an indeterminate spinner. */
  value?: number | null;
  /** @default 100 */
  max?: number;
  /** Text under the circle. Also names the progress bar for screen readers. */
  label?: React.ReactNode;
  /** Show the value in the middle. @default false */
  showValue?: boolean;
  /** @default (v, max) => `${Math.round((v / max) * 100)}%` */
  formatValue?: (value: number, max: number) => string;
  /** @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CircularProgressSize;
  /** Ring thickness in px. Defaults to a value that suits the size. */
  strokeWidth?: number;
  className?: string;
  "aria-label"?: string;
}

const percent = (value: number, max: number) => `${Math.round((value / max) * 100)}%`;

export const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(function CircularProgress(
  {
    value = null,
    max = 100,
    label,
    showValue = false,
    formatValue = percent,
    color = "primary",
    size = "md",
    strokeWidth,
    className,
    "aria-label": ariaLabel,
  },
  ref,
) {
  const id = useId();
  const labelId = id ? `${id}-label` : undefined;
  const { box, stroke: defaultStroke, text } = dimensions[size];
  const stroke = strokeWidth ?? defaultStroke;
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = value === null ? null : Math.min(Math.max(value, 0), max);
  // Indeterminate: a quarter arc that spins.
  const offset = clamped === null ? circumference * 0.75 : circumference * (1 - clamped / max);
  const slots = circular({ color });

  return (
    <div className={slots.base({ class: className })}>
      <ProgressPrimitive.Root
        ref={ref}
        value={clamped}
        max={max}
        getValueLabel={(v, m) => formatValue(v, m)}
        aria-label={ariaLabel}
        aria-labelledby={label && !ariaLabel ? labelId : undefined}
        className={slots.svgWrapper()}
        style={{ width: box, height: box }}
      >
        <svg
          viewBox={`0 0 ${box} ${box}`}
          width={box}
          height={box}
          aria-hidden="true"
          className={clamped === null ? "animate-spin motion-reduce:animate-[spin_1.5s_linear_infinite]" : "-rotate-90"}
        >
          <circle cx={box / 2} cy={box / 2} r={radius} fill="none" strokeWidth={stroke} className={slots.track()} />
          <circle
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={slots.indicator()}
          />
        </svg>
        {showValue && clamped !== null ? (
          <span aria-hidden="true" className={slots.value({ class: text })}>
            {formatValue(clamped, max)}
          </span>
        ) : null}
      </ProgressPrimitive.Root>
      {label ? (
        <span id={labelId} className={slots.label()}>
          {label}
        </span>
      ) : null}
    </div>
  );
});
