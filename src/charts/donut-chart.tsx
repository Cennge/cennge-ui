import * as React from "react";
import { useCenngeDefaults } from "../provider";
import { cn } from "../utils/cn";
import { useId } from "../utils/use-id";
import { chartColor, type ChartColor } from "./colors";
import { ChartTable, defaultChartLabels, useExplorer, useNumberFormats, type ChartLabels } from "./frame";
import { arcPath } from "./path";

type Key<T> = Extract<keyof T, string>;

export interface DonutChartLabels extends ChartLabels {
  /** Under the total, in the middle of the ring. */
  total: string;
  /** The table's column of shares. */
  share: string;
}

export const defaultDonutChartLabels: DonutChartLabels = { ...defaultChartLabels, total: "Total", share: "Share" };

export interface DonutChartProps<T> {
  /** One item per part. Parts are positive: a zero or negative one is left out of the ring. */
  data: readonly T[];
  /** The field that names each part. */
  index: Key<T>;
  /** The field with each part's value. */
  value: Key<T>;
  /** Names the chart for screen readers, and the table that gives them its data. */
  "aria-label": string;
  /** Heads the table's column of names. @default index */
  indexLabel?: string;
  /** Heads the table's column of values. @default value */
  valueLabel?: string;
  /** Each part's colour, in order. @default the palette's slots */
  colors?: readonly (ChartColor | undefined)[];
  /** @default numbers in the provider's locale */
  valueFormat?: (value: number) => string;
  /** A ring with the total in the middle, or a whole pie. @default "donut" */
  variant?: "donut" | "pie";
  /** @default true */
  showLegend?: boolean;
  labels?: Partial<DonutChartLabels>;
  /** Shown when there is nothing to divide. @default labels.empty */
  emptyContent?: React.ReactNode;
  className?: string;
}

const RADIUS = 50;
/** The ring's width, of its radius: wide enough to aim at, thin enough to read as parts of a ring. */
const HOLE = 0.66;
/** The surface between parts, in the ring's units (about 2px at its usual size). */
const GAP = 0.9;
const TAU = Math.PI * 2;

/**
 * A whole and its parts, at a glance: best with a few parts (six at most); to compare close values, use
 * BarChart. The legend gives each part's value and share and is where the eye reads them; the middle of
 * the ring holds the total, or the part pointed at. Hover, a tap or the arrow keys pick a part; screen
 * readers get a table. Drawn on the server too: nothing in it waits for a measure.
 */
export function DonutChart<T>({
  data,
  index,
  value,
  "aria-label": label,
  indexLabel,
  valueLabel,
  colors,
  valueFormat,
  variant = "donut",
  showLegend = true,
  labels: labelsProp,
  emptyContent,
  className,
}: DonutChartProps<T>) {
  const { locale = "en-US" } = useCenngeDefaults();
  const formats = useNumberFormats(valueFormat);
  const percent = React.useMemo(() => new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }), [locale]);
  const labels = { ...defaultDonutChartLabels, ...labelsProp };
  const hintId = useId();

  const parts = data.map((item, i) => {
    const raw = item[value];
    const amount = typeof raw === "number" && Number.isFinite(raw) && raw > 0 ? raw : 0;
    return { name: String(item[index]), amount, color: chartColor(colors?.[i], i) };
  });
  const total = parts.reduce((sum, part) => sum + part.amount, 0);
  const isEmpty = total === 0;
  // Each part's arc, clockwise from 12 o'clock.
  let angle = 0;
  const arcs = parts.map((part) => {
    const start = angle;
    angle += total > 0 ? (part.amount / total) * TAU : 0;
    return { start, end: angle };
  });
  const share = (amount: number) => percent.format(total > 0 ? amount / total : 0);
  const inner = variant === "donut" ? RADIUS * HOLE : 0;
  // The parts in the ring, the ones the pointer and the arrow keys pick from.
  const shown = parts.flatMap((part, i) => (part.amount > 0 ? [i] : []));

  // The part under the pointer: by its angle around the middle, within the ring.
  const indexAt = (event: React.PointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const scale = RADIUS / (box.width / 2);
    const dx = (event.clientX - box.left - box.width / 2) * scale;
    const dy = (event.clientY - box.top - box.height / 2) * scale;
    const distance = Math.hypot(dx, dy);
    if (distance > RADIUS || distance < inner) return null;
    const at = (Math.atan2(dx, -dy) + TAU) % TAU;
    const found = shown.findIndex((i) => at >= arcs[i]!.start && at < arcs[i]!.end);
    return found === -1 ? null : found;
  };
  const { active, handlers } = useExplorer(shown.length, indexAt);
  const picked = active ? shown[active.index]! : null;
  const focus = picked === null ? null : parts[picked]!;

  const describeAt = (i: number) => `${parts[i]!.name}: ${formats.value(parts[i]!.amount)} (${share(parts[i]!.amount)})`;

  return (
    <figure aria-label={label} data-slot="donut-chart" className={cn("flex w-full min-w-0 flex-wrap items-center gap-6", className)}>
      <div className="relative aspect-square w-full max-w-56 shrink-0">
        {isEmpty ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-full border-8 border-default-bg text-sm text-muted">
            {emptyContent ?? labels.empty}
          </div>
        ) : (
          <>
            <svg viewBox="0 0 100 100" aria-hidden="true" className="size-full overflow-visible motion-safe:animate-cennge-pop-in">
              {parts.map((part, i) =>
                part.amount > 0 ? (
                  <path
                    key={i}
                    d={arcPath(RADIUS, RADIUS, RADIUS, inner, arcs[i]!.start, arcs[i]!.end, shown.length > 1 ? GAP : 0)}
                    fillRule="evenodd"
                    style={{ fill: part.color }}
                    className={cn("transition-opacity duration-(--cennge-duration-fast) motion-reduce:transition-none", picked !== null && picked !== i && "opacity-35")}
                  />
                ) : null,
              )}
            </svg>
            {variant === "donut" ? (
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-[22%] text-center">
                <span className="max-w-full truncate text-2xl font-semibold text-foreground" data-slot="donut-value">
                  {formats.value(focus ? focus.amount : total)}
                </span>
                <span className="max-w-full truncate text-xs text-muted">{focus ? focus.name : labels.total}</span>
              </div>
            ) : null}
            <div
              tabIndex={0}
              role="group"
              aria-label={label}
              aria-describedby={hintId}
              data-slot="chart-plot"
              className="absolute inset-0 rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-solid focus-visible:outline-ring"
              {...handlers}
            />
          </>
        )}
      </div>
      {showLegend && !isEmpty ? (
        <ul data-slot="chart-legend" className="flex max-w-80 min-w-40 flex-1 flex-col gap-0.5 text-sm">
          {parts.map((part, i) => (
            // The picked part's row lights up; the others keep full contrast, as text must.
            <li
              key={i}
              data-active={picked === i || undefined}
              className="-mx-2 flex items-center gap-2 rounded-small px-2 py-1 data-[active]:bg-default-bg"
            >
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[3px]" style={{ background: part.color }} />
              <span className="min-w-0 truncate text-foreground">{part.name}</span>
              <span className="ml-auto pl-3 font-semibold text-foreground tabular-nums">{formats.value(part.amount)}</span>
              <span className="w-12 text-right text-xs text-muted tabular-nums">{share(part.amount)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <p id={hintId} className="sr-only">
        {labels.keyboardHint}
      </p>
      <p aria-live="polite" className="sr-only">
        {active?.source === "keyboard" && picked !== null ? describeAt(picked) : ""}
      </p>
      <ChartTable
        caption={label}
        columns={[indexLabel ?? index, valueLabel ?? value, labels.share]}
        rows={[...parts.map((part) => [part.name, formats.value(part.amount), share(part.amount)]), [labels.total, formats.value(total), share(total)]]}
      />
    </figure>
  );
}
