import * as React from "react";
import { useCenngeDefaults } from "../provider";
import { cn } from "../utils/cn";
import { useId } from "../utils/use-id";
import type { ValueScale } from "./scale";
import type { ResolvedReference } from "./series";
import { useSize, type Size } from "./use-size";

export interface ChartLabels {
  /** How to read the values from the keyboard, given to screen readers with the chart. */
  keyboardHint: string;
  /** Shown in place of a chart with nothing to draw. */
  empty: string;
  /** Names the list of goals and ranges read after the data. */
  references: string;
  /** A goal line with no label of its own. */
  reference: string;
  /** A band with no label of its own. */
  range: string;
  /** A band's span, its ends already formatted. */
  rangeValue: (from: string, to: string) => string;
}

export const defaultChartLabels: ChartLabels = {
  keyboardHint: "Arrow keys move between the values.",
  empty: "No data",
  references: "Goals and ranges",
  reference: "Goal",
  range: "Range",
  rangeValue: (from, to) => `${from} to ${to}`,
};

/** Numbers as the provider's locale writes them: values in full, the axis short (1.2K). */
export function useNumberFormats(valueFormat?: (value: number) => string, axisFormat?: (value: number) => string) {
  const { locale = "en-US" } = useCenngeDefaults();
  const formats = React.useMemo(
    () => ({
      full: new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }),
      // Two decimals: a tick at 1250 reads 1.25K, not a misleading 1.3K.
      short: new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 2 }),
    }),
    [locale],
  );
  return {
    value: valueFormat ?? ((value: number) => formats.full.format(value)),
    axis: axisFormat ?? ((value: number) => formats.short.format(value)),
  };
}

/* ---------------------------------------------------------------- legend */

export interface LegendItem {
  key: string;
  label: string;
  color: string;
  /** The mark it stands for: a box for bars and areas, a stroke for lines, a dot for readings. */
  shape: "box" | "line" | "dot";
  value?: string;
}

/** The series by name, each beside a sample of its mark: colour never says which is which alone. */
export function ChartLegend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul data-slot="chart-legend" className={cn("flex flex-wrap gap-x-4 gap-y-1 text-xs", className)}>
      {items.map((item) => (
        <li key={item.key} className="flex min-w-0 items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cn(
              "shrink-0",
              item.shape === "line" ? "h-0.5 w-3 rounded-full" : item.shape === "dot" ? "size-1.5 rounded-full" : "size-2.5 rounded-[3px]",
            )}
            style={{ background: item.color }}
          />
          <span className="truncate text-foreground">{item.label}</span>
          {item.value !== undefined ? <span className="text-muted tabular-nums">{item.value}</span> : null}
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------------------------------------- tooltip */

export interface TooltipRow {
  key: string;
  label: string;
  value: string;
  color: string;
  /** The mark the row is keyed by, as in the legend. @default "line" */
  shape?: LegendItem["shape"];
}

export interface TooltipContent {
  title: string;
  rows: TooltipRow[];
}

/** One readout for every series at a place: the value strong, the name beside it, keyed by a stroke. */
export function ChartTooltip({ content, style }: { content: TooltipContent; style?: React.CSSProperties }) {
  return (
    <div
      // Shown to the eye only: the table and the live region say the same to screen readers.
      aria-hidden="true"
      data-slot="chart-tooltip"
      className="pointer-events-none absolute top-0 left-0 z-10 w-max max-w-64 rounded-medium border border-border bg-surface-4 px-2.5 py-2 text-xs shadow-floating"
      style={style}
    >
      <p className="mb-1.5 font-semibold text-foreground">{content.title}</p>
      <ul className="flex flex-col gap-1">
        {content.rows.map((row) => (
          <li key={row.key} className="flex items-center gap-2">
            <span
              className={cn("shrink-0", row.shape === "dot" ? "mx-[3px] size-1.5 rounded-full" : row.shape === "box" ? "size-2.5 rounded-[3px]" : "h-0.5 w-3 rounded-full")}
              style={{ background: row.color }}
            />
            <span className="truncate text-muted">{row.label}</span>
            <span className="ml-auto pl-3 font-semibold text-foreground tabular-nums">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const describe = ({ title, rows }: TooltipContent) => `${title}: ${rows.map((row) => `${row.label} ${row.value}`).join(", ")}`;

/* ----------------------------------------------------------------- table */

export interface ChartTableData {
  /** Headers: what the rows are (e.g. "Month"), then each series. */
  columns: string[];
  rows: string[][];
}

/** The same data for screen readers, as a table they can walk by row and column. */
export function ChartTable({ caption, columns, rows }: ChartTableData & { caption: string }) {
  return (
    // Hidden by a wrapper: a table clips its own box, not its caption, which would show over the chart.
    <div className="sr-only">
    <table>
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((column, i) => (
            <th key={i} scope="col">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, r) => (
          <tr key={r}>
            {row.map((cell, c) =>
              c === 0 ? (
                <th key={c} scope="row">
                  {cell}
                </th>
              ) : (
                <td key={c}>{cell}</td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}

/* ------------------------------------------------------------- explorer */

export interface Active {
  index: number;
  source: "pointer" | "keyboard";
}

/**
 * Which place is looked at: under the mouse, under a finger (until a tap elsewhere), or moved to with the
 * arrow keys while the plot has focus. `indexAt` gives null where the pointer is over nothing.
 */
export function useExplorer(count: number, indexAt: (event: React.PointerEvent<HTMLElement>) => number | null) {
  const [active, setActive] = React.useState<Active | null>(null);
  const plot = React.useRef<HTMLDivElement>(null);
  const current = active && active.index < count ? active : null;

  // A tapped place stays until a tap outside the plot.
  React.useEffect(() => {
    if (!current || current.source !== "pointer") return;
    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && !plot.current?.contains(event.target as Node)) setActive(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [current]);

  const handlers = {
    ref: plot,
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
      // Touch moves only while the finger is down: it scrubs along the chart.
      const index = indexAt(event);
      setActive(index === null ? null : { index, source: "pointer" });
    },
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse") return;
      const index = indexAt(event);
      setActive(index === null ? null : { index, source: "pointer" });
    },
    onPointerLeave: (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse") setActive(null);
    },
    onFocus: (event: React.FocusEvent<HTMLDivElement>) => {
      // From the keyboard, focus shows the first place at once; a click shows where it is.
      if (event.currentTarget.matches(":focus-visible")) setActive((previous) => previous ?? { index: 0, source: "keyboard" });
    },
    onBlur: () => setActive(null),
    onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
      const from = current?.index ?? -1;
      const moves: Record<string, number> = {
        ArrowRight: from + 1,
        ArrowDown: from + 1,
        ArrowLeft: from - 1,
        ArrowUp: from - 1,
        Home: 0,
        End: count - 1,
      };
      if (event.key === "Escape" && current) {
        event.preventDefault();
        setActive(null);
        return;
      }
      const to = moves[event.key];
      if (to === undefined || count === 0) return;
      event.preventDefault();
      setActive({ index: Math.min(count - 1, Math.max(0, to)), source: "keyboard" });
    },
  };
  return { active: current, handlers };
}

/* ------------------------------------------------------------- the frame */

export interface CartesianFrameProps {
  slot: string;
  label: string;
  /** "vertical": categories along the bottom, values up the side; "horizontal": the other way round. */
  orientation: "vertical" | "horizontal";
  /** Labels of the categories, in order. */
  categories: string[];
  /** A category's place: the middle of its band (bars), or a point from one edge to the other (lines). */
  placement: "band" | "point";
  scale: ValueScale;
  axisFormat: (value: number) => string;
  /** Values in full, for the references read to screen readers. */
  valueFormat?: (value: number) => string;
  references?: ResolvedReference[];
  showGrid: boolean;
  showCategoryAxis: boolean;
  showValueAxis: boolean;
  legend: LegendItem[] | null;
  table: ChartTableData;
  tooltip: (index: number) => TooltipContent;
  /** Draws the marks in pixels, once the plot is measured. */
  renderMarks: (size: Size, active: number | null) => React.ReactNode;
  labels: ChartLabels;
  emptyContent?: React.ReactNode;
  className?: string;
}

/** About how wide a category label is, in pixels, for leaving labels out where they would overlap. */
const labelWidth = (text: string) => text.length * 6.6 + 14;

/**
 * Legend, axes, grid, plot, tooltip, keyboard and table around a chart's marks. The axes are HTML placed
 * in percent and the grid an SVG in percent, so the server sends them where they will stay; the marks
 * are drawn in pixels once the plot is measured.
 */
export function CartesianFrame({
  slot,
  label,
  orientation,
  categories,
  placement,
  scale,
  axisFormat,
  valueFormat = String,
  references = [],
  showGrid,
  showCategoryAxis,
  showValueAxis,
  legend,
  table,
  tooltip,
  renderMarks,
  labels,
  emptyContent,
  className,
}: CartesianFrameProps) {
  const [measure, size] = useSize<HTMLDivElement>();
  const hintId = useId();
  const count = categories.length;
  const isVertical = orientation === "vertical";
  const isEmpty = count === 0;

  const indexAt = (event: React.PointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = isVertical ? (event.clientX - box.left) / box.width : (event.clientY - box.top) / box.height;
    const index = placement === "band" ? Math.floor(ratio * count) : Math.round(ratio * (count - 1));
    return Math.min(count - 1, Math.max(0, index));
  };
  const { active, handlers } = useExplorer(count, indexAt);

  // Where category i sits along its axis, from 0 to 1.
  const at = (index: number) => (placement === "band" ? (index + 0.5) / count : count === 1 ? 0.5 : index / (count - 1));

  // Leave labels out where they would overlap: every step-th one is shown. Before the plot is measured
  // (on the server), a narrow plot is assumed.
  const length = isVertical ? (size?.width ?? 320) : (size?.height ?? 200);
  const each = isVertical ? Math.max(...categories.map(labelWidth), 1) : 18;
  const step = Math.max(1, Math.ceil(count / Math.max(1, Math.floor(length / each))));

  const ticks = scale.ticks;
  const tickLabels = ticks.map(axisFormat);
  // The value axis is as wide as its longest label: `ch` is the width of a digit, known on the server too.
  const valueAxisWidth = `calc(${Math.max(...tickLabels.map((text) => text.length), 1)}ch + 0.5rem)`;
  const categoryAxisWidth = `min(calc(${Math.max(...categories.map((text) => text.length), 1)}ch + 0.75rem), 40%)`;
  const sideWidth = isVertical ? (showValueAxis ? valueAxisWidth : "0px") : showCategoryAxis ? categoryAxisWidth : "0px";

  const content = active ? tooltip(active.index) : null;
  let tooltipStyle: React.CSSProperties | undefined;
  if (active && size) {
    const position = at(active.index);
    // Kept within the plot, so on a phone it never pushes the page sideways.
    const { width, height } = size;
    if (isVertical) {
      const x = position * width;
      // Beside the place, on the side with more room.
      const left = x < width * 0.55 ? `min(${x + 12}px, ${width}px - 100%)` : `max(0px, ${x - 12}px - 100%)`;
      tooltipStyle = { transform: `translate(calc(${left}), 4px)` };
    } else {
      const y = position * height;
      const half = height / count / 2;
      // Bars grow from the left, so the right is where there is room; below the bar, or above it near the end.
      const top = y < height * 0.55 ? `${y + half + 6}px` : `calc(${y - half - 6}px - 100%)`;
      tooltipStyle = { transform: `translate(calc(${width}px - 100%), ${top})` };
    }
  }

  const categoryLabel = (text: string, index: number) => {
    if (index % step !== 0) return null;
    const position = at(index);
    if (!isVertical) {
      return (
        <span key={index} className="absolute right-2 left-0 -translate-y-1/2 truncate text-right" style={{ top: `${position * 100}%` }}>
          {text}
        </span>
      );
    }
    // Points at the very ends: their labels keep inside the plot instead of centring on the edge.
    const edge = placement === "point" && count > 1 && (index === 0 ? "start" : index === count - 1 ? "end" : null);
    return (
      <span
        key={index}
        className={cn("absolute top-0 whitespace-nowrap", edge === "start" ? "" : edge === "end" ? "-translate-x-full" : "-translate-x-1/2")}
        style={{ left: `${position * 100}%` }}
      >
        {text}
      </span>
    );
  };

  const valueLabel = (text: string, tick: number) => {
    const ratio = scale.ratio(tick);
    return isVertical ? (
      <span key={tick} className="absolute right-2 -translate-y-1/2" style={{ top: `${(1 - ratio) * 100}%` }}>
        {text}
      </span>
    ) : (
      // The last one ends at its line rather than past the edge of the chart.
      <span
        key={tick}
        className={cn("absolute top-0 whitespace-nowrap", ratio >= 1 ? "-translate-x-full" : "-translate-x-1/2")}
        style={{ left: `${ratio * 100}%` }}
      >
        {text}
      </span>
    );
  };

  const zero = scale.min <= 0 && scale.max >= 0 ? scale.ratio(0) : null;
  // Where a value sits along the value axis, in percent from the top (vertical) or the left (horizontal).
  const along = (value: number) => {
    const ratio = Math.min(1, Math.max(0, scale.ratio(value)));
    // Rounded: 19.999999999999996% helps no one reading the markup.
    return Math.round((isVertical ? 1 - ratio : ratio) * 100_000) / 1000;
  };
  // A fixed domain may leave a reference out: a line outside it is not drawn, a band is cut at its edge.
  const isInside = (value: number) => value >= scale.min && value <= scale.max;
  const bands = references.filter(
    (reference): reference is Extract<ResolvedReference, { kind: "band" }> =>
      reference.kind === "band" && reference.to >= scale.min && reference.from <= scale.max,
  );
  const lines = references.filter(
    (reference): reference is Extract<ResolvedReference, { kind: "line" }> => reference.kind === "line" && isInside(reference.value),
  );
  const drawn = [...bands, ...lines];

  return (
    <figure aria-label={label} data-slot={slot} className={cn("flex h-72 w-full min-w-0 flex-col gap-3", className)}>
      {legend ? <ChartLegend items={legend} /> : null}
      <div className="flex min-h-0 flex-1 pt-1.5">
        {(isVertical ? showValueAxis : showCategoryAxis) && !isEmpty ? (
          // Digits of equal width for values only: in names, Inter's tabular figures widen the hyphens too.
          <div aria-hidden="true" className={cn("relative shrink-0 text-xs text-muted", isVertical && "tabular-nums")} style={{ width: sideWidth }}>
            {isVertical ? ticks.map((tick, i) => valueLabel(tickLabels[i]!, tick)) : categories.map(categoryLabel)}
          </div>
        ) : null}
        <div ref={measure} className="relative min-w-0 flex-1">
          {isEmpty ? (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">{emptyContent ?? labels.empty}</div>
          ) : null}
          <svg aria-hidden="true" className="absolute inset-0 size-full overflow-visible" shapeRendering="crispEdges">
            {isEmpty
              ? null
              : bands.map((band, i) => {
                  const [start, end] = isVertical ? [along(band.to), along(band.from)] : [along(band.from), along(band.to)];
                  // Plain percentages: SVG attributes take no calc().
                  const [offset, size] = [`${start}%`, `${end - start}%`];
                  // Thin edges in the band's colour, so its bounds show where its tint is faint.
                  const edges = [start, end].map((at) => `${at}%`);
                  return (
                    <g key={i} data-slot="chart-reference-band">
                      <rect
                        {...(isVertical ? { x: 0, width: "100%", y: offset, height: size } : { y: 0, height: "100%", x: offset, width: size })}
                        style={{ fill: `color-mix(in oklab, ${band.color} 14%, transparent)` }}
                      />
                      {edges.map((edge, e) => (
                        <line
                          key={e}
                          {...(isVertical ? { x1: 0, x2: "100%", y1: edge, y2: edge } : { y1: 0, y2: "100%", x1: edge, x2: edge })}
                          style={{ stroke: `color-mix(in oklab, ${band.color} 70%, transparent)` }}
                        />
                      ))}
                    </g>
                  );
                })}
            {showGrid && !isEmpty
              ? ticks.map((tick) => {
                  const ratio = scale.ratio(tick);
                  const offset = isVertical ? `${(1 - ratio) * 100}%` : `${ratio * 100}%`;
                  return isVertical ? (
                    <line key={tick} x1="0" x2="100%" y1={offset} y2={offset} className="stroke-border" />
                  ) : (
                    <line key={tick} y1="0" y2="100%" x1={offset} x2={offset} className="stroke-border" />
                  );
                })
              : null}
            {zero !== null && !isEmpty ? (
              isVertical ? (
                <line x1="0" x2="100%" y1={`${(1 - zero) * 100}%`} y2={`${(1 - zero) * 100}%`} className="stroke-default-500/60" />
              ) : (
                <line y1="0" y2="100%" x1={`${zero * 100}%`} x2={`${zero * 100}%`} className="stroke-default-500/60" />
              )
            ) : null}
          </svg>
          {isEmpty
            ? null
            : drawn.map((reference, i) => {
                if (!reference.label) return null;
                const at = along(reference.kind === "line" ? reference.value : Math.min(reference.to, scale.max));
                // Under the marks: data is never hidden behind a label.
                const isNearStart = at < 10;
                return (
                  <span
                    key={i}
                    aria-hidden="true"
                    data-slot="chart-reference-label"
                    className="pointer-events-none absolute rounded-[3px] px-1 text-[11px] leading-4 font-medium whitespace-nowrap text-muted"
                    style={{
                      background: "var(--cennge-chart-surface, var(--cennge-surface-3))",
                      ...(isVertical
                        ? { right: 0, top: `${at}%`, transform: isNearStart ? "translateY(2px)" : "translateY(calc(-100% - 2px))" }
                        : { top: 0, left: `${at}%`, transform: isNearStart ? "translateX(4px)" : "translateX(calc(-100% - 4px))" }),
                    }}
                  >
                    {reference.label}
                  </span>
                );
              })}
          {size && size.width > 0 && size.height > 0 && !isEmpty ? (
            <svg
              aria-hidden="true"
              viewBox={`0 0 ${size.width} ${size.height}`}
              // Between a resize and the next measure the marks stretch with the plot, as the axes do, instead
              // of shrinking to fit inside it.
              preserveAspectRatio="none"
              className="absolute inset-0 size-full overflow-visible"
              data-slot="chart-marks"
            >
              {renderMarks(size, active?.index ?? null)}
            </svg>
          ) : null}
          {lines.length && !isEmpty ? (
            // Over the marks: a goal stays visible across the bars that pass it.
            <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full overflow-visible" shapeRendering="crispEdges">
              {lines.map((line, i) => {
                const offset = `${along(line.value)}%`;
                return (
                  <line
                    key={i}
                    data-slot="chart-reference-line"
                    {...(isVertical ? { x1: 0, x2: "100%", y1: offset, y2: offset } : { y1: 0, y2: "100%", x1: offset, x2: offset })}
                    stroke={line.color}
                    strokeWidth={1.5}
                    strokeDasharray="5 4"
                  />
                );
              })}
            </svg>
          ) : null}
          {isEmpty ? null : (
            <div
              tabIndex={0}
              role="group"
              aria-label={label}
              aria-describedby={hintId}
              data-slot="chart-plot"
              className={cn(
                "absolute inset-0 rounded-small outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-solid focus-visible:outline-ring",
                // A finger scrubs along the chart; the page still scrolls the other way.
                isVertical ? "touch-pan-y" : "touch-pan-x",
              )}
              {...handlers}
            />
          )}
          {content ? <ChartTooltip content={content} style={tooltipStyle} /> : null}
        </div>
      </div>
      {(isVertical ? showCategoryAxis : showValueAxis) && !isEmpty ? (
        <div aria-hidden="true" className={cn("relative h-4 shrink-0 text-xs text-muted", !isVertical && "tabular-nums")} style={{ marginLeft: sideWidth }}>
          {isVertical ? categories.map(categoryLabel) : ticks.map((tick, i) => valueLabel(tickLabels[i]!, tick))}
        </div>
      ) : null}
      <p id={hintId} className="sr-only">
        {labels.keyboardHint}
      </p>
      <p aria-live="polite" className="sr-only">
        {active?.source === "keyboard" && content ? describe(content) : ""}
      </p>
      <ChartTable caption={label} columns={table.columns} rows={table.rows} />
      {references.length ? (
        <ul aria-label={labels.references} className="sr-only">
          {references.map((reference, i) => (
            <li key={i}>
              {`${reference.label ?? (reference.kind === "line" ? labels.reference : labels.range)}: ${
                reference.kind === "line" ? valueFormat(reference.value) : labels.rangeValue(valueFormat(reference.from), valueFormat(reference.to))
              }`}
            </li>
          ))}
        </ul>
      ) : null}
    </figure>
  );
}
