import { cn } from "../utils/cn";
import { useId } from "../utils/use-id";
import { chartColor, type ChartColor } from "./colors";
import { areaPath, linePath, runs, type Point } from "./path";

export interface SparklineProps {
  /** The values, oldest first. A missing one (null) breaks the line. */
  data: readonly (number | null)[];
  /** What it shows and which way it goes, e.g. "Downloads over 12 weeks, up by half". */
  "aria-label": string;
  /** A line, or a line with the area under it washed in its colour. @default "line" */
  variant?: "line" | "area";
  /** @default "linear" */
  curve?: "linear" | "smooth";
  /** @default the trend in grey and the latest value in the accent; given, both take it */
  color?: ChartColor;
  /** A dot on the latest value. @default true */
  showLast?: boolean;
  /** Size it here. @default h-8 w-24 */
  className?: string;
}

/** Room above and below the line, of the height, so its stroke and the dot stay inside. */
const MARGIN = 10;

/**
 * A trend at a glance, beside the number it belongs to (a stat card). No axes and no readout: a picture
 * named for screen readers, so its label says what it shows. Drawn whole on the server.
 */
export function Sparkline({ data, "aria-label": label, variant = "line", curve = "linear", color, showLast = true, className }: SparklineProps) {
  const id = useId();
  const values = data.filter((value): value is number => value !== null && Number.isFinite(value));
  const low = values.length ? Math.min(...values) : 0;
  const high = values.length ? Math.max(...values) : 0;
  const span = high - low;
  const count = data.length;
  // In a 100 × 100 box stretched to the element: x across, y down. A flat trend runs through the middle.
  const x = (i: number) => (count === 1 ? 50 : (i / (count - 1)) * 100);
  const y = (value: number) => (span === 0 ? 50 : MARGIN + (1 - (value - low) / span) * (100 - 2 * MARGIN));
  const points = data.map((value, i): Point | null => (value === null || !Number.isFinite(value) ? null : [x(i), y(value)]));
  const stretches = runs(points.map((point) => point !== null)).map((run) => run.map((i) => points[i]!));
  const last = [...points].reverse().find((point) => point !== null) ?? null;
  const stroke = chartColor(color ?? "default", 0);
  const dot = chartColor(color ?? "chart-1", 0);

  return (
    <span role="img" aria-label={label} data-slot="sparkline" className={cn("relative inline-block h-8 w-24 shrink-0 align-middle", className)}>
      <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" style={{ color: stroke }}>
        {variant === "area" ? (
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity={0.28} />
              <stop offset="1" stopColor="currentColor" stopOpacity={0.02} />
            </linearGradient>
          </defs>
        ) : null}
        {stretches.map((stretch, s) =>
          stretch.length === 1 ? null : (
            <g key={s}>
              {variant === "area" ? (
                <path d={areaPath(stretch, stretch.map(([px]): Point => [px, 100]), curve)} fill={`url(#${id})`} />
              ) : null}
              <path
                d={linePath(stretch, curve)}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinejoin="round"
                strokeLinecap="round"
                // The box is stretched: the stroke keeps its 1.5px.
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ),
        )}
      </svg>
      {/* The dots are HTML, placed in percent: in the stretched box a circle would be squashed. */}
      {stretches.map((stretch, s) =>
        stretch.length === 1 && !(showLast && stretch[0] === last) ? (
          <span key={s} className="absolute size-1 -translate-1/2 rounded-full" style={{ left: `${stretch[0]![0]}%`, top: `${stretch[0]![1]}%`, background: stroke }} />
        ) : null,
      )}
      {showLast && last ? (
        <span
          data-slot="sparkline-last"
          className="absolute size-1.5 -translate-1/2 rounded-full"
          style={{ left: `${last[0]}%`, top: `${last[1]}%`, background: dot }}
        />
      ) : null}
    </span>
  );
}
