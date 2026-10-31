import { CartesianFrame } from "./frame";
import { barPath, type BarEnd } from "./path";
import { stack, valueScale } from "./scale";
import { useCartesianData, type CartesianChartProps } from "./series";
import type { Size } from "./use-size";

export interface BarChartProps<T> extends CartesianChartProps<T> {
  /** "vertical": columns rising from the bottom; "horizontal": bars from the side, for long names. @default "vertical" */
  layout?: "vertical" | "horizontal";
  /** The series in one bar, piled up, instead of side by side. */
  isStacked?: boolean;
  /** The thickest a bar gets, in pixels: the rest of its band stays open. @default 24 */
  barSize?: number;
}

/** The surface showing between neighbouring bars, and between the parts of a stacked one. */
const GAP = 2;
const RADIUS = 4;

/**
 * Values compared by length: one bar per category and series, side by side or stacked. Each bar is
 * rounded at its data end and square on the baseline. Hover, a tap or the arrow keys show every series'
 * value at a category; screen readers get the same data as a table.
 */
export function BarChart<T>(props: BarChartProps<T>) {
  const { "aria-label": label, layout = "vertical", isStacked = false, barSize = 24, domain } = props;
  const { categories, columns, colors, formats, labels, legend, table, tooltip } = useCartesianData(props, "box");
  const stacks = isStacked ? stack(columns) : null;
  const values = stacks ? stacks.flat(2) : columns.flat().filter((value): value is number => value !== null);
  const scale = valueScale(values, { domain });
  const isVertical = layout === "vertical";

  const renderMarks = ({ width, height }: Size, active: number | null) => {
    const along = isVertical ? width : height;
    const across = isVertical ? height : width;
    const count = categories.length;
    const band = along / count;
    const slots = isStacked ? 1 : columns.length;
    const thickness = Math.max(1, Math.min(barSize, (band * 0.72 - GAP * (slots - 1)) / slots));
    const group = thickness * slots + GAP * (slots - 1);
    // Along the value axis, in pixels from its low end.
    const at = (value: number) => Math.min(across, Math.max(0, scale.ratio(value) * across));
    const base = at(Math.min(scale.max, Math.max(scale.min, 0)));

    /** A bar from value `from` (on the baseline side) to `to`, `offset` pixels along the category axis. */
    const bar = (offset: number, from: number, to: number, hasGap: boolean, isRounded: boolean) => {
      const direction = to < from ? -1 : 1;
      const start = at(from) + (hasGap ? GAP * direction : 0);
      const end = at(to);
      if ((end - start) * direction <= 0) return null;
      const [low, high] = start < end ? [start, end] : [end, start];
      const dataEnd: BarEnd = isVertical ? (direction < 0 ? "bottom" : "top") : direction < 0 ? "left" : "right";
      const radius = isRounded ? RADIUS : 0;
      return isVertical
        ? barPath(offset, across - high, thickness, high - low, radius, dataEnd)
        : barPath(low, offset, high - low, thickness, radius, dataEnd);
    };

    // The outermost part of each stack, up and down, is the one with the rounded end.
    const outermost = (direction: 1 | -1, i: number) => {
      let last = -1;
      columns.forEach((column, s) => {
        const value = column[i];
        if (value !== null && value !== undefined && value * direction > 0) last = s;
      });
      return last;
    };

    return (
      <>
        {active !== null ? (
          <rect
            className="fill-default-500/10"
            {...(isVertical ? { x: active * band, y: 0, width: band, height } : { x: 0, y: active * band, width, height: band })}
          />
        ) : null}
        {/* Every bar grows out of the baseline at once, as the chart appears. */}
        <g
          className={isVertical ? "motion-safe:animate-cennge-grow-y" : "motion-safe:animate-cennge-grow-x"}
          style={{ transformOrigin: isVertical ? `0 ${across - base}px` : `${base}px 0` }}
        >
          {columns.map((column, s) => (
            <g key={s} className="fill-current" style={{ color: colors[s] }}>
              {column.map((value, i) => {
                if (value === null || value === 0) return null;
                const start = i * band + (band - group) / 2;
                let d: string | null;
                if (stacks) {
                  const [from, to] = stacks[s]![i]!;
                  d = bar(start, from, to, from !== 0, outermost(value > 0 ? 1 : -1, i) === s);
                } else {
                  d = bar(start + s * (thickness + GAP), 0, value, false, true);
                }
                return d ? <path key={i} d={d} /> : null;
              })}
            </g>
          ))}
        </g>
      </>
    );
  };

  return (
    <CartesianFrame
      slot="bar-chart"
      label={label}
      orientation={layout}
      categories={categories}
      placement="band"
      scale={scale}
      axisFormat={formats.axis}
      showGrid={props.showGrid ?? true}
      showCategoryAxis={(isVertical ? props.showXAxis : props.showYAxis) ?? true}
      showValueAxis={(isVertical ? props.showYAxis : props.showXAxis) ?? true}
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
