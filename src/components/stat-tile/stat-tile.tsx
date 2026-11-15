import * as React from "react";
import { useCenngeDefaults } from "../../provider";
import { tv } from "../../utils/tv";
import type { CenngeRadius } from "../../types";
import type { CardVariant } from "../card";

export type StatTileDirection = "up" | "down" | "none";

export interface StatTileLabels {
  /** Read after a change the good way, so its meaning is not in its colour alone. */
  good: string;
  /** Read after a change the other way. */
  bad: string;
}

export const defaultStatTileLabels: StatTileLabels = { good: "better", bad: "worse" };

const tile = tv({
  slots: {
    // A size container: the value steps down in a narrow tile, two to a row on a phone.
    base: "@container flex min-w-0 flex-col gap-1 p-5 text-foreground",
    header: "flex min-w-0 items-center gap-2 text-sm text-muted",
    icon: "flex size-4 shrink-0 items-center justify-center [&>svg]:size-4",
    label: "min-w-0 break-words",
    value: "flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-2xl leading-8 font-semibold @[11rem]:text-[1.75rem] @[11rem]:leading-9 tracking-[-0.015em] tabular-nums",
    unit: "text-base font-medium text-muted",
    footer: "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted",
    delta: "inline-flex shrink-0 items-center gap-1 rounded-small px-1.5 py-0.5 text-xs font-semibold tabular-nums",
    chart: "mt-3 min-w-0",
  },
  variants: {
    variant: {
      raised: { base: "bg-surface-3 shadow-raised" },
      bordered: { base: "border border-border bg-surface-3" },
      flat: { base: "bg-surface-3" },
    },
    radius: {
      none: { base: "rounded-none" },
      sm: { base: "rounded-small" },
      md: { base: "rounded-medium" },
      lg: { base: "rounded-large" },
      full: { base: "rounded-[1.5rem]" },
    },
    tone: {
      good: { delta: "bg-success-bg text-success-text" },
      bad: { delta: "bg-danger-bg text-danger-text" },
      neutral: { delta: "bg-default-500/15 text-foreground" },
    },
  },
  defaultVariants: { variant: "flat", radius: "lg", tone: "neutral" },
});

export interface StatTileProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** What the number is: "Commits this week". */
  label: React.ReactNode;
  /** The number, as you want it written: a number is formatted in the provider's locale. */
  value: React.ReactNode;
  /** After the value, smaller: "kg", "kcal", "min". */
  unit?: React.ReactNode;
  /** A small icon before the label. */
  icon?: React.ReactNode;
  /** The change since the period before, signed: 2.4, -120. */
  delta?: number;
  /** How the change is written. @default signed, in the provider's locale, with `unit` after it: "+2.4 kg" */
  formatDelta?: (delta: number) => string;
  /** What the change is measured against: "vs last week". */
  deltaLabel?: React.ReactNode;
  /**
   * Which way is good news: "up" for steps or commits, "down" for body weight, resting heart rate or bundle
   * size, "none" for a number that is neither. Colours the change green or red, and screen readers hear
   * "better" or "worse" after it. @default "up"
   */
  goodDirection?: StatTileDirection;
  /** Under the numbers: a Sparkline, a Progress, a RangeMeter. */
  chart?: React.ReactNode;
  /** @default "flat" */
  variant?: CardVariant;
  /** @default the provider's radius, or "lg" */
  radius?: CenngeRadius;
  /** The words screen readers hear after the change, for another language. */
  labels?: Partial<StatTileLabels>;
  classNames?: Partial<Record<"base" | "header" | "icon" | "label" | "value" | "unit" | "footer" | "delta" | "chart", string>>;
}

function Arrow({ direction }: { direction: "up" | "down" }) {
  return (
    <svg viewBox="0 0 12 12" className="size-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path
        d={direction === "up" ? "M6 9.5v-7M3 5.5l3-3 3 3" : "M6 2.5v7M3 6.5l3 3 3-3"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * One number that matters, with its unit and how it moved since last time: green when it moved the good
 * way, which you set, so a falling weight can be the good news. A chart fits under it.
 */
export const StatTile = React.forwardRef<HTMLDivElement, StatTileProps>(function StatTile(
  {
    label,
    value,
    unit,
    icon,
    delta,
    formatDelta,
    deltaLabel,
    goodDirection = "up",
    chart,
    variant = "flat",
    radius: radiusProp,
    labels: labelsProp,
    className,
    classNames,
    ...rest
  },
  ref,
) {
  const defaults = useCenngeDefaults();
  const { locale = "en-US" } = defaults;
  const radius = radiusProp ?? defaults.radius ?? "lg";
  const labels = { ...defaultStatTileLabels, ...labelsProp };
  const numbers = React.useMemo(
    () => ({
      value: new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }),
      delta: new Intl.NumberFormat(locale, { maximumFractionDigits: 2, signDisplay: "exceptZero" }),
    }),
    [locale],
  );
  // The change as it is written: one too small to show (float noise, 82.4 - 82.4000001) is no change.
  const shown = delta === undefined || !Number.isFinite(delta) ? undefined : formatDelta ? delta : Number(delta.toFixed(2));
  const direction = shown === undefined || shown === 0 ? null : shown > 0 ? "up" : "down";
  const tone = !direction || goodDirection === "none" ? "neutral" : direction === goodDirection ? "good" : "bad";
  const slots = tile({ variant, radius, tone });
  const deltaText =
    shown === undefined
      ? null
      : formatDelta
        ? formatDelta(shown)
        : // A true minus sign, the width of the plus.
          `${numbers.delta.format(shown).replace("-", "−")}${typeof unit === "string" ? (unit === "%" ? "%" : ` ${unit}`) : ""}`;

  return (
    <div ref={ref} data-slot="stat-tile" className={slots.base({ class: [classNames?.base, className] })} {...rest}>
      <div className={slots.header({ class: classNames?.header })}>
        {icon ? (
          <span aria-hidden="true" className={slots.icon({ class: classNames?.icon })}>
            {icon}
          </span>
        ) : null}
        <span className={slots.label({ class: classNames?.label })}>{label}</span>
      </div>
      <div className={slots.value({ class: classNames?.value })}>
        <div className="min-w-0 [overflow-wrap:anywhere]">{typeof value === "number" ? numbers.value.format(value) : value}</div>
        {unit ? <span className={slots.unit({ class: classNames?.unit })}>{unit}</span> : null}
      </div>
      {deltaText !== null || deltaLabel ? (
        <div className={slots.footer({ class: classNames?.footer })}>
          {deltaText !== null ? (
            <span data-slot="stat-tile-delta" data-tone={tone} className={slots.delta({ class: classNames?.delta })}>
              {direction ? <Arrow direction={direction} /> : null}
              {deltaText}
              {tone === "neutral" ? null : <span className="sr-only">, {tone === "good" ? labels.good : labels.bad}</span>}
            </span>
          ) : null}
          {deltaLabel ? <span>{deltaLabel}</span> : null}
        </div>
      ) : null}
      {chart ? <div className={slots.chart({ class: classNames?.chart })}>{chart}</div> : null}
    </div>
  );
});
