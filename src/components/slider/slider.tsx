import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";
import { tv } from "../../utils/tv";
import { useCenngeDefaults } from "../../provider";
import { useId } from "../../utils/use-id";
import type { CenngeColor, CenngeSize } from "../../types";

const slider = tv({
  slots: {
    base: "flex w-full flex-col gap-2",
    header: "flex items-center justify-between gap-3 text-sm",
    label: "font-medium text-foreground",
    output: "text-muted tabular-nums",
    root: [
      "relative flex w-full touch-none items-center select-none",
      "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-(--cennge-disabled-opacity)",
    ],
    track: "relative grow overflow-hidden rounded-full bg-surface-4 inset-shadow-[inset_0_1px_2px_rgb(0_0_0/0.25)]",
    range: "absolute h-full rounded-full",
    tick: "absolute top-1/2 -translate-1/2 rounded-full bg-foreground/30",
    marks: "@container relative -mt-1 h-4 text-xs",
    mark: [
      "absolute top-0 left-0 cursor-pointer whitespace-nowrap text-muted tabular-nums",
      "transition-colors duration-(--cennge-duration-fast) hover:text-foreground motion-reduce:transition-none",
      "data-[selected]:font-medium data-[selected]:text-foreground",
    ],
    thumb: [
      "block cursor-grab rounded-full border-2 bg-white shadow-raised",
      "transition-[transform,box-shadow] duration-(--cennge-duration-fast) ease-tactile motion-reduce:transition-none",
      "hover:scale-110 active:cursor-grabbing active:scale-95",
      "outline-none focus-visible:ring-4",
    ],
  },
  variants: {
    // --slider-thumb is the thumb's width: marks are placed where the thumb's centre stops.
    size: {
      sm: { base: "[--slider-thumb:0.875rem]", root: "h-4", track: "h-1", tick: "size-1", thumb: "size-3.5" },
      md: { base: "[--slider-thumb:1.125rem]", root: "h-5", track: "h-1.5", tick: "size-1", thumb: "size-4.5" },
      lg: { base: "[--slider-thumb:1.375rem]", root: "h-6", track: "h-2", tick: "size-1.5", thumb: "size-5.5" },
    },
    color: {
      default: {
        range: "bg-default-500",
        tick: "data-[in-range]:bg-white/70",
        thumb: "border-default-500 focus-visible:ring-default-500/30",
      },
      primary: {
        range: "bg-primary",
        tick: "data-[in-range]:bg-primary-foreground/50",
        thumb: "border-primary focus-visible:ring-primary/30",
      },
      secondary: {
        range: "bg-secondary",
        tick: "data-[in-range]:bg-secondary-foreground/60",
        thumb: "border-secondary focus-visible:ring-secondary/30",
      },
      success: {
        range: "bg-success",
        tick: "data-[in-range]:bg-success-foreground/50",
        thumb: "border-success focus-visible:ring-success/30",
      },
      warning: {
        range: "bg-warning",
        tick: "data-[in-range]:bg-warning-foreground/50",
        thumb: "border-warning focus-visible:ring-warning/30",
      },
      danger: {
        range: "bg-danger",
        tick: "data-[in-range]:bg-danger-foreground/60",
        thumb: "border-danger focus-visible:ring-danger/30",
      },
      info: {
        range: "bg-info",
        tick: "data-[in-range]:bg-info-foreground/60",
        thumb: "border-info focus-visible:ring-info/30",
      },
    },
    // Disabled fades the track and thumbs; text turns muted rather than faint, so it stays readable.
    isDisabled: {
      true: { label: "text-muted", mark: "cursor-not-allowed hover:text-muted data-[selected]:text-muted" },
    },
  },
});

type SliderValue = number | number[];

export interface SliderMark {
  value: number;
  /**
   * Text under the track. When every value the slider can take has a text label (log levels 0–3, or
   * `restrictToMarks`), the label also names the value: the thumb reads "Info" rather than "2".
   */
  label?: React.ReactNode;
}

export interface SliderProps<V extends SliderValue = SliderValue> {
  label?: React.ReactNode;
  /** A number for one thumb, an array for a range. */
  value?: V;
  defaultValue?: V;
  onValueChange?: (value: V) => void;
  /** Fires once the user releases the thumb. */
  onValueCommit?: (value: V) => void;
  /** @default 0 */
  min?: number;
  /** @default 100 */
  max?: number;
  /** @default 1 */
  step?: number;
  /**
   * Points on the scale: a dot on the track, plus a label under it when given. A click on a label
   * moves the nearest thumb there. Plain numbers are dots without labels.
   */
  marks?: Array<number | SliderMark>;
  /** Thumbs stop only on the marks: dragging snaps to the nearest one, arrow keys go mark to mark. */
  restrictToMarks?: boolean;
  /** Show the current value next to the label. @default true when there is a label */
  showValue?: boolean;
  /** Format the shown value, e.g. `(v) => `${v}%``. */
  formatValue?: (value: number) => string;
  /** @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  isDisabled?: boolean;
  name?: string;
  className?: string;
  "aria-label"?: string;
}

const toArray = (v: SliderValue | undefined) => (v === undefined ? undefined : Array.isArray(v) ? v : [v]);

/** Marks inside [min, max], sorted, one per value. */
function normalizeMarks(marks: SliderProps["marks"], min: number, max: number): SliderMark[] {
  const byValue = new Map<number, SliderMark>();
  for (const mark of marks ?? []) {
    const item = typeof mark === "number" ? { value: mark } : mark;
    if (item.value >= min && item.value <= max && !byValue.has(item.value)) byValue.set(item.value, item);
  }
  return [...byValue.values()].sort((a, b) => a.value - b.value);
}

function nearest(stops: number[], target: number) {
  let best = stops[0] ?? target;
  for (const stop of stops) if (Math.abs(stop - target) < Math.abs(best - target)) best = stop;
  return best;
}

/** Radix keeps the thumb inside the track, so its centre runs from half a thumb in to half a thumb before the end. */
const thumbCentre = (fraction: number, width: string) =>
  `calc(var(--slider-thumb) / 2 + (${width} - var(--slider-thumb)) * ${fraction})`;

const STEP_KEYS: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 };

export function Slider<V extends SliderValue = SliderValue>({
  label,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  marks,
  restrictToMarks = false,
  showValue,
  formatValue,
  color,
  size,
  isDisabled = false,
  name,
  className,
  "aria-label": ariaLabel,
}: SliderProps<V>) {
  const defaults = useCenngeDefaults();
  const id = useId();
  const isRange = Array.isArray(value ?? defaultValue);
  const markList = React.useMemo(() => normalizeMarks(marks, min, max), [marks, min, max]);
  const stops = restrictToMarks && markList.length > 0 ? markList.map((mark) => mark.value) : null;
  const snap = (values: number[]) => (stops ? values.map((v) => nearest(stops, v)) : values);
  const [inner, setInner] = React.useState<number[]>(() => snap(toArray(defaultValue) ?? [min]));
  const current = toArray(value) ?? inner;
  const fromArray = (next: number[]) => (isRange ? next : next[0]) as V;
  const thumbs = React.useRef<Array<HTMLSpanElement | null>>([]);

  const slots = slider({
    size: size ?? defaults.size ?? "md",
    color: color ?? (defaults.color && defaults.color !== "default" ? defaults.color : "primary"),
    isDisabled,
  });
  const labelId = id ? `${id}-label` : undefined;
  const span = max - min;
  const fraction = (v: number) => (span > 0 ? (v - min) / span : 0);
  // Labels name the values only when all of them have one, so the readout never mixes "Info" and "2".
  const isNamed =
    markList.length > 0 &&
    markList.every((mark) => typeof mark.label === "string") &&
    (stops !== null || (step > 0 && markList.length === Math.round(span / step) + 1));
  const describe = (v: number) => {
    if (formatValue) return formatValue(v);
    const markLabel = isNamed ? markList.find((mark) => mark.value === v)?.label : undefined;
    return typeof markLabel === "string" ? markLabel : String(v);
  };
  const low = current.length > 1 ? Math.min(...current) : min;
  const high = Math.max(...current);

  const update = (next: number[], commit: boolean) => {
    if (value === undefined) setInner(next);
    onValueChange?.(fromArray(next));
    if (commit) onValueCommit?.(fromArray(next));
  };

  /** A click on a mark's label: the nearest thumb goes there (on a tie, the one that can without crossing). */
  const moveToMark = (target: number) => {
    if (isDisabled) return;
    let index = 0;
    current.forEach((v, i) => {
      const distance = Math.abs(v - target);
      const best = Math.abs((current[index] ?? v) - target);
      if (distance < best || (distance === best && target > v)) index = i;
    });
    if (current[index] !== target) update(current.map((v, i) => (i === index ? target : v)), true);
    thumbs.current[index]?.focus({ preventScroll: true });
  };

  /** With restrictToMarks, keys move between marks; Radix would step by `step` and snap back. */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (!stops || isDisabled) return;
    const index = Number((event.target as HTMLElement).dataset.thumb);
    const now = current[index];
    if (now === undefined) return;
    const keyStep = STEP_KEYS[event.key];
    let position: number;
    if (event.key === "Home") position = 0;
    else if (event.key === "End") position = stops.length - 1;
    else if (keyStep !== undefined) {
      const count = Math.abs(keyStep) === 1 && event.shiftKey ? 10 : Math.abs(keyStep);
      if (keyStep > 0) {
        const above = stops.findIndex((stop) => stop > now);
        position = above === -1 ? -1 : above + count - 1;
      } else {
        let below = -1;
        stops.forEach((stop, i) => {
          if (stop < now) below = i;
        });
        position = below === -1 ? -1 : below - count + 1;
      }
    } else return;
    event.preventDefault();
    if (position === -1) return;
    const target = stops[Math.min(Math.max(position, 0), stops.length - 1)] ?? now;
    // Thumbs of a range do not pass each other.
    const bounded = Math.min(Math.max(target, current[index - 1] ?? -Infinity), current[index + 1] ?? Infinity);
    if (bounded !== now) update(current.map((v, i) => (i === index ? bounded : v)), true);
  };

  return (
    <div className={slots.base({ class: className })} data-disabled={isDisabled || undefined}>
      {label || showValue ? (
        <div className={slots.header()}>
          {label ? (
            <span id={labelId} className={slots.label()}>
              {label}
            </span>
          ) : (
            <span />
          )}
          {(showValue ?? Boolean(label)) ? (
            <output className={slots.output()}>{current.map(describe).join(" – ")}</output>
          ) : null}
        </div>
      ) : null}
      <SliderPrimitive.Root
        value={current}
        onValueChange={(next) => {
          const snapped = snap(next);
          if (String(snapped) !== String(current)) update(snapped, false);
        }}
        onValueCommit={(next) => onValueCommit?.(fromArray(snap(next)))}
        onKeyDown={handleKeyDown}
        min={min}
        max={max}
        // Between marks the pointer needs a fine step, or a coarse one could round past a mark.
        step={stops && span > 0 ? span / 1000 : step}
        disabled={isDisabled}
        name={name}
        className={slots.root()}
      >
        <SliderPrimitive.Track className={slots.track()}>
          <SliderPrimitive.Range className={slots.range()} />
          {markList.map((mark) => (
            <span
              key={mark.value}
              data-slot="tick"
              className={slots.tick()}
              style={{ left: thumbCentre(fraction(mark.value), "100%") }}
              data-in-range={(mark.value >= low && mark.value <= high) || undefined}
            />
          ))}
        </SliderPrimitive.Track>
        {current.map((thumbValue, index) => (
          <SliderPrimitive.Thumb
            key={index}
            ref={(node: HTMLSpanElement | null) => {
              thumbs.current[index] = node;
            }}
            data-thumb={index}
            className={slots.thumb()}
            aria-label={ariaLabel ?? (isRange ? (index === 0 ? "Minimum" : "Maximum") : undefined)}
            aria-labelledby={!ariaLabel && !isRange && label ? labelId : undefined}
            aria-valuetext={describe(thumbValue)}
          />
        ))}
      </SliderPrimitive.Root>
      {markList.some((mark) => mark.label !== undefined) ? (
        // Visual scale only: the thumbs already speak their values, and arrow keys reach every mark.
        <div className={slots.marks()} aria-hidden="true">
          {markList.map((mark) =>
            mark.label === undefined ? null : (
              <span
                key={mark.value}
                data-slot="mark"
                className={slots.mark()}
                // Centred under the dot, but kept inside the slider: long first and last labels align to its edges.
                style={{ translate: `clamp(0px, calc(${thumbCentre(fraction(mark.value), "100cqw")} - 50%), calc(100cqw - 100%))` }}
                data-selected={current.includes(mark.value) || undefined}
                onClick={() => moveToMark(mark.value)}
              >
                {mark.label}
              </span>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
