import * as React from "react";
import { useCenngeDefaults } from "../../provider";
import { chartColor } from "../../charts/colors";
import { cn } from "../../utils/cn";
import { useId } from "../../utils/use-id";
import type { ChartColor } from "../../types";

export type ProgressRingSize = "sm" | "md" | "lg" | "xl";

export interface ProgressRingLabels {
  /** The value against the goal, numbers already written in the locale. */
  of: (value: string, max: string) => string;
  /** Added after `of` past the goal, with the amount over it. */
  over: (amount: string) => string;
}

export const defaultProgressRingLabels: ProgressRingLabels = {
  of: (value, max) => `${value} of ${max}`,
  over: (amount) => `${amount} over`,
};

/** One goal on the ring: how far `value` has got towards `max`. */
export interface ProgressRingGoal {
  value: number;
  /** The goal. Past it the ring keeps going round, over its own start. @default 100 */
  max?: number;
  /** Names the goal for screen readers, e.g. "Commits". Show it in a legend of your own beside the ring. */
  label: string;
  /** A theme colour, a chart palette slot (`chart-1`…`chart-8`) or any CSS colour. */
  color?: ChartColor;
  /** The text screen readers hear. @default "34 of 40", "46 of 40, 6 over" */
  formatValue?: (value: number, max: number) => string;
}

export interface ProgressRingProps {
  /** How far the goal has got. For several goals, one ring each, give `rings` instead. */
  value?: number;
  /** @default 100 */
  max?: number;
  /**
   * Names the ring for screen readers; with `rings`, names the group of them. Say what is measured:
   * "Commits this week".
   */
  "aria-label": string;
  /** @default the chart palette in order, the first following the accent */
  color?: ChartColor;
  /** The text screen readers hear for `value`. @default "34 of 40", "46 of 40, 6 over" */
  formatValue?: (value: number, max: number) => string;
  /** Several goals, one ring each, the first outermost. Each takes the next chart colour unless it has its own. */
  rings?: readonly ProgressRingGoal[];
  /** 48, 80, 128 or 176 pixels across, or any number of pixels. @default "lg" */
  size?: ProgressRingSize | number;
  /**
   * The width of each ring in pixels. Defaults to a tenth of the size, a little less with several rings;
   * narrowed when the rings would not fit.
   */
  strokeWidth?: number;
  /** The words of the default text screen readers hear, for another language. */
  labels?: Partial<ProgressRingLabels>;
  /**
   * What sits in the middle, for the eye: the number that matters, its unit, an icon. Screen readers hear
   * the ring's own text instead, so put nothing here that only it says, and no controls.
   */
  children?: React.ReactNode;
  className?: string;
  classNames?: Partial<Record<"base" | "svg" | "track" | "indicator" | "content", string>>;
}

const sizes: Record<ProgressRingSize, number> = { sm: 48, md: 80, lg: 128, xl: 176 };

/** The middle's type, by the ring's size: yours to change through `classNames.content` or the children. */
const contentText = (box: number) =>
  box < 64 ? "text-[11px] font-semibold" : box < 104 ? "text-sm font-semibold" : box < 152 ? "text-base" : "text-lg";

const transition = "transition-[stroke-dashoffset] duration-700 ease-tactile motion-safe:animate-cennge-ring motion-reduce:transition-none";

/** Where an angle (clockwise from 12 o'clock, in turns) falls on a circle. */
const pointAt = (cx: number, r: number, turns: number): [number, number] => {
  const angle = turns * 2 * Math.PI;
  return [cx + r * Math.sin(angle), cx - r * Math.cos(angle)];
};

/** A number to draw with: anything that is not one counts as the fallback. */
const finite = (n: number | undefined, fallback: number) => (typeof n === "number" && Number.isFinite(n) ? n : fallback);

/**
 * Progress towards a goal as a ring, or one ring per goal, nested. Past the goal a ring keeps going round
 * over its own start, a shadow at its leading end where it overlaps, so 46 of 40 reads as more than full
 * rather than full. The middle holds whatever you put there; screen readers hear each ring as a meter.
 */
export const ProgressRing = React.forwardRef<HTMLDivElement, ProgressRingProps>(function ProgressRing(
  {
    value = 0,
    max = 100,
    "aria-label": label,
    color,
    formatValue,
    rings,
    size = "lg",
    strokeWidth,
    labels: labelsProp,
    children,
    className,
    classNames,
  },
  ref,
) {
  const id = useId();
  const { locale = "en-US" } = useCenngeDefaults();
  const number = React.useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);
  const labels = { ...defaultProgressRingLabels, ...labelsProp };
  const describe = (current: number, goal: number) => {
    const text = labels.of(number.format(current), number.format(goal));
    return current > goal ? `${text}, ${labels.over(number.format(current - goal))}` : text;
  };

  // An empty `rings` is one ring with nothing done, so a tracker with no goals yet still draws.
  const hasRings = Boolean(rings?.length);
  const goals = (hasRings ? rings! : [{ value, max, label, color, formatValue }]).map((goal) => {
    const goalMax = finite(goal.max ?? 100, 100);
    // A goal of nothing (or less) is met by anything: it counts as one.
    return { ...goal, value: Math.max(0, finite(goal.value, 0)), max: goalMax > 0 ? goalMax : 1 };
  });
  const isNested = goals.length > 1;
  const box = Math.max(8, typeof size === "number" ? size : sizes[size]);
  const center = box / 2;
  const gapFor = (width: number) => (isNested ? Math.max(2, Math.round(width * 0.18)) : 0);
  // The rings leave a hole of at least a third of the size in the middle: the stroke narrows to fit them.
  const room = center - box / 6;
  let stroke = strokeWidth ?? Math.max(4, Math.round(box * (isNested ? 0.085 : 0.1)));
  while (stroke > 1 && goals.length * stroke + (goals.length - 1) * gapFor(stroke) > room) stroke -= 1;
  const gap = gapFor(stroke);

  const geometry = goals.map((goal, i) => ({
    goal,
    color: chartColor(goal.color ?? (hasRings ? color : undefined), i),
    radius: center - stroke / 2 - i * (stroke + gap),
  }));
  const innermost = geometry[geometry.length - 1]!.radius - stroke / 2;

  return (
    <div
      ref={ref}
      role={isNested ? "group" : undefined}
      aria-label={isNested ? label : undefined}
      data-slot="progress-ring"
      className={cn("relative inline-grid shrink-0 place-items-center", classNames?.base, className)}
      style={{ width: box, height: box }}
    >
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${box} ${box}`}
        width={box}
        height={box}
        className={cn("col-start-1 row-start-1 overflow-visible", classNames?.svg)}
      >
        {geometry.map(({ goal, color: ringColor, radius }, i) => {
          const length = 2 * Math.PI * radius;
          const ratio = goal.value / goal.max;
          const isOver = ratio > 1;
          // The part of the last lap: a whole lap when the value is an exact multiple of the goal.
          const arc = isOver ? (ratio % 1 === 0 ? 1 : ratio % 1) : ratio;
          const [capX, capY] = pointAt(center, radius, arc);
          const ahead = arc * 2 * Math.PI;
          const filterId = `${id}-cap-${i}`;
          const circle = { cx: center, cy: center, r: radius, fill: "none", strokeWidth: stroke };
          return (
            // In forced colours the rings are drawn in the system's text colour over a grey track.
            <g key={i} style={{ color: ringColor }} className="forced-colors:text-[CanvasText]">
              {/* The track: the ring's own colour, dimmed, so each goal is told by its hue even when empty. */}
              <circle
                {...circle}
                data-slot="progress-ring-track"
                className={cn("forced-colors:[stroke:GrayText]", classNames?.track)}
                style={{ stroke: `color-mix(in oklab, ${ringColor} 20%, transparent)` }}
              />
              <g transform={`rotate(-90 ${center} ${center})`}>
                {/*
                 * The first lap is always the same circle, so crossing the goal only carries it on to full;
                 * the lap past the goal is a second circle over it.
                 */}
                {ratio > 0 ? (
                  <circle
                    {...circle}
                    data-slot="progress-ring-indicator"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeDasharray={length}
                    strokeDashoffset={length * (1 - Math.min(ratio, 1))}
                    className={cn(transition, classNames?.indicator)}
                    style={{ "--cennge-ring-length": `${length}px` } as React.CSSProperties}
                  />
                ) : null}
                {isOver ? (
                  <circle
                    {...circle}
                    data-slot="progress-ring-lap"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeDasharray={length}
                    strokeDashoffset={length * (1 - arc)}
                    className={cn(transition, classNames?.indicator)}
                    style={{ "--cennge-ring-length": `${length}px`, animationDelay: "600ms" } as React.CSSProperties}
                  />
                ) : null}
              </g>
              {isOver ? (
                <>
                  <defs>
                    {/* The shadow falls ahead of the leading end, onto the lap it passes over. */}
                    <filter id={filterId} x="-100%" y="-100%" width="300%" height="300%">
                      <feDropShadow
                        dx={Math.cos(ahead) * stroke * 0.22}
                        dy={Math.sin(ahead) * stroke * 0.22}
                        stdDeviation={stroke * 0.2}
                        floodColor="#000"
                        floodOpacity={0.6}
                      />
                    </filter>
                  </defs>
                  <circle
                    data-slot="progress-ring-overlap"
                    cx={capX}
                    cy={capY}
                    r={stroke / 2}
                    fill="currentColor"
                    filter={`url(#${filterId})`}
                    className="motion-safe:animate-[cennge-fade-in_240ms_ease-out_1200ms_backwards]"
                  />
                </>
              ) : null}
            </g>
          );
        })}
      </svg>
      {geometry.map(({ goal }, i) => (
        <span
          key={i}
          role="meter"
          aria-label={goal.label}
          aria-valuemin={0}
          aria-valuemax={goal.max}
          // A meter's value stays within its range; the text says how far past the goal it went.
          aria-valuenow={Math.min(goal.value, goal.max)}
          aria-valuetext={(goal.formatValue ?? describe)(goal.value, goal.max)}
          className="sr-only"
        />
      ))}
      {children !== undefined ? (
        <div
          aria-hidden="true"
          data-slot="progress-ring-content"
          className={cn(
            "col-start-1 row-start-1 flex flex-col items-center justify-center text-center leading-tight text-foreground tabular-nums",
            contentText(box),
            classNames?.content,
          )}
          // Inside the innermost ring, with a little room.
          style={{ maxWidth: Math.max(0, innermost * 2 * 0.86) }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
});
