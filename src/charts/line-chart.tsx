import { useId } from "../utils/use-id";
import { CartesianFrame } from "./frame";
import { areaPath, linePath, runs, type Point } from "./path";
import { stack, valueScale } from "./scale";
import { useCartesianData, type CartesianChartProps } from "./series";
import type { Size } from "./use-size";

export interface LineChartProps<T> extends CartesianChartProps<T> {
  /** "smooth" bends through the points without overshooting them: a count never dips below zero. @default "linear" */
  curve?: "linear" | "smooth";
  /** A dot on every value, not only where the readout is. @default false */
  showDots?: boolean;
  /** The value axis starts at zero. Off, it fits the data, for changes small next to the values. @default true */
  startAtZero?: boolean;
}

export interface AreaChartProps<T> extends Omit<LineChartProps<T>, "startAtZero"> {
  /** The series piled up, each filling down to the one below: a whole made of parts. */
  isStacked?: boolean;
}

/*
 * The ring around a dot, in the colour behind the chart, keeps it clear of the lines it sits on: an 8px dot
 * with 2px of ring, the stroke painted under the fill. Charts usually sit on a Card; elsewhere set
 * --cennge-chart-surface to the colour behind.
 */
const ring = { stroke: "var(--cennge-chart-surface, var(--cennge-surface-3))", strokeWidth: 4, paintOrder: "stroke" } as const;

function LinearChart<T>({
  kind,
  curve = "linear",
  showDots = false,
  startAtZero = true,
  isStacked = false,
  ...props
}: AreaChartProps<T> & { kind: "line" | "area"; startAtZero?: boolean }) {
  const { "aria-label": label, domain } = props;
  const { categories, columns, colors, formats, labels, legend, table, tooltip } = useCartesianData(props, kind === "line" ? "line" : "box");
  const id = useId();
  const stacks = kind === "area" && isStacked ? stack(columns) : null;
  const values = stacks ? stacks.flat(2) : columns.flat().filter((value): value is number => value !== null);
  // Areas fill down to zero, so zero is on their axis.
  const scale = valueScale(values, { domain, includeZero: kind === "area" || startAtZero });

  const renderMarks = ({ width, height }: Size, active: number | null) => {
    const count = categories.length;
    const x = (i: number) => (count === 1 ? width / 2 : (i / (count - 1)) * width);
    const y = (value: number) => height - Math.min(1, Math.max(0, scale.ratio(value))) * height;
    const base = y(Math.min(scale.max, Math.max(scale.min, 0)));
    // The top of each series at each place: its value, or the top of its part of the stack. In a stack a
    // missing value counts as zero, so the parts above still rest on something.
    const tops = columns.map((column, s) =>
      column.map((value, i): Point | null => (stacks ? [x(i), y(stacks[s]![i]![1])] : value === null ? null : [x(i), y(value)])),
    );

    return (
      <>
        <g className="motion-safe:animate-cennge-reveal">
          {columns.map((_column, s) => {
            const points = tops[s]!;
            const lines = runs(points.map((point) => point !== null)).map((run) => ({ run, top: run.map((i) => points[i]!) }));
            return (
              <g key={s} style={{ color: colors[s] }}>
                {kind === "area" ? (
                  <>
                    <defs>
                      {/* A wash of the series' colour, fading towards the floor. */}
                      <linearGradient id={`${id}-${s}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="currentColor" stopOpacity={0.24} />
                        <stop offset="1" stopColor="currentColor" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    {lines.map(({ run, top }, r) => {
                      const floor = run.map((i): Point => [x(i), stacks ? y(stacks[s]![i]![0]) : base]);
                      return <path key={r} d={areaPath(top, floor, curve)} fill={`url(#${id}-${s})`} />;
                    })}
                  </>
                ) : null}
                {lines.map(({ top }, r) =>
                  top.length === 1 ? (
                    // A value alone between gaps: a dot, or it would not show at all.
                    <circle key={r} cx={top[0]![0]} cy={top[0]![1]} r={2.5} fill="currentColor" />
                  ) : (
                    <path
                      key={r}
                      d={linePath(top, curve)}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  ),
                )}
                {showDots
                  ? tops[s]!.map((point, i) => (point ? <circle key={i} cx={point[0]} cy={point[1]} r={4} fill="currentColor" {...ring} /> : null))
                  : null}
              </g>
            );
          })}
        </g>
        {active !== null ? (
          <g data-slot="chart-crosshair">
            <line x1={x(active)} x2={x(active)} y1={0} y2={height} className="stroke-default-500/50" strokeWidth={1} />
            {tops.map((points, s) => {
              const point = points[active];
              return point ? <circle key={s} cx={point[0]} cy={point[1]} r={4} fill={colors[s]} {...ring} /> : null;
            })}
          </g>
        ) : null}
      </>
    );
  };

  return (
    <CartesianFrame
      slot={kind === "line" ? "line-chart" : "area-chart"}
      label={label}
      orientation="vertical"
      categories={categories}
      placement="point"
      scale={scale}
      axisFormat={formats.axis}
      showGrid={props.showGrid ?? true}
      showCategoryAxis={props.showXAxis ?? true}
      showValueAxis={props.showYAxis ?? true}
      legend={legend}
      table={table}
      tooltip={tooltip}
      renderMarks={renderMarks}
      labels={labels}
      emptyContent={props.emptyContent}
      className={props.className}
    />
  );
}

/**
 * Change over time, a line per series. Hover, a tap or the arrow keys put a crosshair on a place and read
 * every series there; screen readers get the same data as a table. A missing value breaks its line.
 */
export function LineChart<T>(props: LineChartProps<T>) {
  return <LinearChart {...props} kind="line" />;
}

/**
 * A line with the area under it washed in its colour: one quantity over time, or with `isStacked` how a
 * whole splits into parts. Read like LineChart.
 */
export function AreaChart<T>(props: AreaChartProps<T>) {
  return <LinearChart {...props} kind="area" />;
}
