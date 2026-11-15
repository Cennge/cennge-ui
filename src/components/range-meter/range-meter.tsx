import * as React from "react";
import { useCenngeDefaults } from "../../provider";
import { chartColor } from "../../charts/colors";
import { tv } from "../../utils/tv";
import { useId } from "../../utils/use-id";
import type { CenngeColor, CenngeSize, ChartColor } from "../../types";

/** Where the value stands: short of the floor, within the goal, past the ceiling, or no goal at all. */
export type RangeMeterStatus = "below" | "within" | "over" | "none";

export interface RangeMeterLabels {
  /** Under `low`: how much is left to reach it, e.g. "38 g to go". */
  toGo: (amount: string) => string;
  /** Past `high`: by how much, e.g. "136 kcal over". */
  over: (amount: string) => string;
  /** Between `low` and `high`. */
  within: string;
  /** At or past `low`, with no `high`. */
  reached: string;
  /** Under `high`, with no `low`: the room left, e.g. "640 kcal left". */
  underLimit: (amount: string) => string;
  /** The goal in the text screen readers hear, e.g. "goal 1,800–2,200 kcal". */
  goal: (goal: string) => string;
}

export const defaultRangeMeterLabels: RangeMeterLabels = {
  toGo: (amount) => `${amount} to go`,
  over: (amount) => `${amount} over`,
  within: "In range",
  reached: "Goal reached",
  underLimit: (amount) => `${amount} left`,
  goal: (goal) => `goal ${goal}`,
};

const themeColors: ReadonlySet<string> = new Set<CenngeColor>(["default", "primary", "secondary", "success", "warning", "danger", "info"]);

const meter = tv({
  slots: {
    base: "flex w-full flex-col gap-2",
    header: "flex items-baseline justify-between gap-3 text-sm",
    label: "min-w-0 font-medium break-words text-foreground",
    value: "shrink-0 text-muted tabular-nums",
    amount: "font-semibold text-foreground",
    // A translucent grey: visible on every surface it sits on, a page or a card, in both themes.
    track: [
      "relative w-full rounded-full bg-default-500/20 inset-shadow-[inset_0_1px_2px_rgb(0_0_0/0.2)]",
      "forced-colors:border forced-colors:border-[CanvasText]",
    ],
    band: "absolute inset-y-0 bg-success/25 forced-colors:hidden",
    fill: [
      "absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-tactile motion-reduce:transition-none",
      "forced-colors:bg-[Highlight]",
    ],
    excess: [
      "absolute inset-y-0 rounded-r-full transition-[left,width] duration-500 ease-tactile motion-reduce:transition-none",
      // Forced colours drop background images: the excess is outlined instead of striped.
      "forced-colors:border forced-colors:border-dashed forced-colors:border-[Highlight]",
    ],
    tick: "absolute -inset-y-1 w-0.5 -translate-x-1/2 rounded-full bg-foreground/70 forced-colors:bg-[CanvasText]",
    status: "flex items-center gap-1.5 text-xs text-muted",
  },
  variants: {
    size: {
      sm: { track: "h-1" },
      md: { track: "h-2" },
      lg: { track: "h-3" },
    },
    color: {
      default: { fill: "bg-default-500", excess: "text-default-500" },
      primary: { fill: "bg-primary", excess: "text-primary" },
      secondary: { fill: "bg-secondary", excess: "text-secondary" },
      success: { fill: "bg-success", excess: "text-success" },
      warning: { fill: "bg-warning", excess: "text-warning" },
      danger: { fill: "bg-danger", excess: "text-danger" },
      info: { fill: "bg-info", excess: "text-info" },
      custom: {},
    },
  },
  defaultVariants: { size: "md", color: "primary" },
});

export interface RangeMeterProps {
  /** The amount so far. */
  value: number;
  /** What is measured, above the bar. Also names the meter for screen readers. */
  label: React.ReactNode;
  /** The floor: under it, short of the goal ("38 g to go"). */
  low?: number;
  /** The ceiling: past it, over ("136 kcal over"); under it alone, the room left ("640 kcal left"). */
  high?: number;
  /** @default 0 */
  min?: number;
  /**
   * The end of the bar. @default a quarter past the goal, or the value when it is further. With no goal
   * and no `max` there is no bar, only the amount.
   */
  max?: number;
  /** Written once, after the numbers: "g", "kcal", "ml", "%". */
  unit?: string;
  /** How each number is written. @default the provider's locale, up to two decimals */
  formatValue?: (value: number) => string;
  /**
   * The fill's colour: a theme colour, a chart palette slot (`chart-1`…`chart-8`) or any CSS colour, to
   * match a ProgressRing beside it. @default by status: `default` (grey) short of the goal, `success`
   * within it, `warning` over, `primary` with no goal. Past the ceiling the excess is striped whatever the colour.
   */
  color?: ChartColor;
  /** The status line under the bar. @default true */
  showStatus?: boolean;
  /** @default "md" */
  size?: CenngeSize;
  /** The words of the status and of the text screen readers hear, for another language. */
  labels?: Partial<RangeMeterLabels>;
  className?: string;
  classNames?: Partial<Record<"base" | "header" | "label" | "value" | "track" | "band" | "fill" | "excess" | "tick" | "status", string>>;
  "aria-label"?: string;
}

// Short of the goal is grey, not the accent: an accent of green or red would say "in range" or "wrong".
const stateColor: Record<RangeMeterStatus, CenngeColor> = { below: "default", within: "success", over: "warning", none: "primary" };

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 shrink-0 text-success-text" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * An amount against a goal with a floor, a ceiling or both: protein to reach, sodium to stay under,
 * calories to land between. The status is written out ("38 g to go", "In range", "136 kcal over"), the
 * goal is marked on the bar, and screen readers hear it all as a meter.
 */
export const RangeMeter = React.forwardRef<HTMLDivElement, RangeMeterProps>(function RangeMeter(
  {
    value: valueProp,
    label,
    low: lowProp,
    high: highProp,
    min = 0,
    max,
    unit,
    formatValue,
    color,
    showStatus = true,
    size = "md",
    labels: labelsProp,
    className,
    classNames,
    "aria-label": ariaLabel,
  },
  ref,
) {
  const id = useId();
  const labelId = id ? `${id}-label` : undefined;
  const { locale = "en-US" } = useCenngeDefaults();
  const number = React.useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);
  const format = formatValue ?? ((n: number) => number.format(n));
  // "72%", but "48 s": a percent sign sits against its number.
  const withUnit = (text: string) => (!unit ? text : unit === "%" ? `${text}%` : `${text} ${unit}`);
  const labels = { ...defaultRangeMeterLabels, ...labelsProp };

  const value = Number.isFinite(valueProp) ? valueProp : min;
  // A floor above its ceiling is read the other way round.
  const [low, high] = lowProp !== undefined && highProp !== undefined && lowProp > highProp ? [highProp, lowProp] : [lowProp, highProp];
  const status: RangeMeterStatus =
    low === undefined && high === undefined ? "none" : low !== undefined && value < low ? "below" : high !== undefined && value > high ? "over" : "within";
  const goalTop = high ?? low ?? value;
  const end = max ?? Math.max(value, min + (goalTop - min) * 1.25);
  const span = end - min || 1;
  const at = (n: number) => `${Math.min(100, Math.max(0, ((n - min) / span) * 100))}%`;

  const statusText =
    status === "below"
      ? labels.toGo(withUnit(format(low! - value)))
      : status === "over"
        ? labels.over(withUnit(format(value - high!)))
        : status === "none"
          ? null
          : low !== undefined && high !== undefined
            ? labels.within
            : low !== undefined
              ? labels.reached
              : labels.underLimit(withUnit(format(high! - value)));
  const goalText =
    low !== undefined && high !== undefined ? `${format(low)}–${format(high)}` : low !== undefined ? format(low) : high !== undefined ? format(high) : null;

  const fillColor = color ?? stateColor[status];
  const isTheme = themeColors.has(fillColor);
  const custom = isTheme ? undefined : chartColor(fillColor, 0);
  const slots = meter({ size, color: isTheme ? (fillColor as CenngeColor) : "custom" });
  // With nothing to measure against, a bar would only ever look four fifths full.
  const hasBar = status !== "none" || max !== undefined;
  // A mark at either end of the bar says nothing: the end of the track is there.
  const marks = [low, high].filter((mark): mark is number => mark !== undefined && mark > min && mark < end);
  const bandEdges = low !== undefined && high !== undefined ? [low <= min && "rounded-l-full", high >= end && "rounded-r-full"] : [];
  // Over the ceiling: solid up to it, striped past it.
  const solidEnd = status === "over" ? high! : value;

  return (
    <div ref={ref} data-slot="range-meter" data-status={status} className={slots.base({ class: [classNames?.base, className] })}>
      <div className={slots.header({ class: classNames?.header })}>
        <span id={labelId} className={slots.label({ class: classNames?.label })}>
          {label}
        </span>
        <span aria-hidden={hasBar ? true : undefined} className={slots.value({ class: classNames?.value })}>
          <span className={slots.amount()}>{format(value)}</span>
          {goalText ? ` / ${withUnit(goalText)}` : unit ? withUnit("") : null}
        </span>
      </div>
      {hasBar ? (
      <div
        role="meter"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : labelId}
        aria-valuemin={min}
        aria-valuemax={end}
        aria-valuenow={Math.min(Math.max(value, min), end)}
        aria-valuetext={[withUnit(format(value)), goalText ? labels.goal(withUnit(goalText)) : null, statusText].filter(Boolean).join(", ")}
        className={slots.track({ class: classNames?.track })}
      >
        {low !== undefined && high !== undefined ? (
          <span className={slots.band({ class: [bandEdges, classNames?.band] })} style={{ left: at(low), width: `calc(${at(high)} - ${at(low)})` }} />
        ) : null}
        <span
          className={slots.fill({ class: [status === "over" && "rounded-r-none", classNames?.fill] })}
          style={{ width: at(solidEnd), background: custom }}
        />
        {status === "over" ? (
          <span
            data-slot="range-meter-excess"
            className={slots.excess({ class: classNames?.excess })}
            style={{
              left: at(high!),
              width: `calc(${at(value)} - ${at(high!)})`,
              color: custom,
              backgroundImage: "repeating-linear-gradient(135deg, currentColor 0 3px, color-mix(in oklab, currentColor 45%, transparent) 3px 6px)",
            }}
          />
        ) : null}
        {marks.map((mark) => (
          <span key={mark} data-slot="range-meter-tick" className={slots.tick({ class: classNames?.tick })} style={{ left: at(mark) }} />
        ))}
      </div>
      ) : null}
      {showStatus && statusText ? (
        <p aria-hidden="true" className={slots.status({ class: classNames?.status })}>
          {status === "within" ? <CheckIcon /> : null}
          <span className={status === "over" ? "font-medium text-foreground" : undefined}>{statusText}</span>
        </p>
      ) : null}
    </div>
  );
});
