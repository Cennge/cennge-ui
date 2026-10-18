import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";
import { tv } from "../../utils/tv";
import { useCenngeDefaults } from "../../provider";
import { useId } from "../../utils/use-id";
import type { CenngeColor, CenngeSize } from "../../types";

const slider = tv({
  slots: {
    base: "flex w-full flex-col gap-2 data-[disabled]:opacity-(--cennge-disabled-opacity)",
    header: "flex items-center justify-between gap-3 text-sm",
    label: "font-medium text-foreground",
    output: "text-muted tabular-nums",
    root: "relative flex w-full touch-none items-center select-none data-[disabled]:cursor-not-allowed",
    track: "relative grow overflow-hidden rounded-full bg-surface-4 inset-shadow-[inset_0_1px_2px_rgb(0_0_0/0.25)]",
    range: "absolute h-full rounded-full",
    thumb: [
      "block cursor-grab rounded-full border-2 bg-white shadow-raised",
      "transition-[transform,box-shadow] duration-(--cennge-duration-fast) ease-tactile motion-reduce:transition-none",
      "hover:scale-110 active:cursor-grabbing active:scale-95",
      "outline-none focus-visible:ring-4",
    ],
  },
  variants: {
    size: {
      sm: { root: "h-4", track: "h-1", thumb: "size-3.5" },
      md: { root: "h-5", track: "h-1.5", thumb: "size-4.5" },
      lg: { root: "h-6", track: "h-2", thumb: "size-5.5" },
    },
    color: {
      default: { range: "bg-default-500", thumb: "border-default-500 focus-visible:ring-default-500/30" },
      primary: { range: "bg-primary", thumb: "border-primary focus-visible:ring-primary/30" },
      secondary: { range: "bg-secondary", thumb: "border-secondary focus-visible:ring-secondary/30" },
      success: { range: "bg-success", thumb: "border-success focus-visible:ring-success/30" },
      warning: { range: "bg-warning", thumb: "border-warning focus-visible:ring-warning/30" },
      danger: { range: "bg-danger", thumb: "border-danger focus-visible:ring-danger/30" },
      info: { range: "bg-info", thumb: "border-info focus-visible:ring-info/30" },
    },
  },
});

type SliderValue = number | number[];

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

export function Slider<V extends SliderValue = SliderValue>({
  label,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  showValue,
  formatValue = String,
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
  const [inner, setInner] = React.useState<number[]>(toArray(defaultValue) ?? [min]);
  const current = toArray(value) ?? inner;
  const fromArray = (next: number[]) => (isRange ? next : next[0]) as V;

  const slots = slider({
    size: size ?? defaults.size ?? "md",
    color: color ?? (defaults.color && defaults.color !== "default" ? defaults.color : "primary"),
  });
  const labelId = id ? `${id}-label` : undefined;
  const shown = current.map(formatValue).join(" – ");

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
          {(showValue ?? Boolean(label)) ? <output className={slots.output()}>{shown}</output> : null}
        </div>
      ) : null}
      <SliderPrimitive.Root
        value={toArray(value)}
        defaultValue={toArray(defaultValue)}
        onValueChange={(next) => {
          if (value === undefined) setInner(next);
          onValueChange?.(fromArray(next));
        }}
        onValueCommit={(next) => onValueCommit?.(fromArray(next))}
        min={min}
        max={max}
        step={step}
        disabled={isDisabled}
        name={name}
        className={slots.root()}
      >
        <SliderPrimitive.Track className={slots.track()}>
          <SliderPrimitive.Range className={slots.range()} />
        </SliderPrimitive.Track>
        {current.map((thumbValue, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className={slots.thumb()}
            aria-label={ariaLabel ?? (isRange ? (index === 0 ? "Minimum" : "Maximum") : undefined)}
            aria-labelledby={!ariaLabel && !isRange && label ? labelId : undefined}
            aria-valuetext={formatValue(thumbValue)}
          />
        ))}
      </SliderPrimitive.Root>
    </div>
  );
}
