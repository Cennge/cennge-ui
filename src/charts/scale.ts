/**
 * A step of 1, 2, 2.5 or 5 times a power of ten, so that about `count` steps cover `span`: the nearest of
 * them on a log scale, so 1025 a step rounds to 1000 and not up to 2000 with a half-empty axis.
 */
export function niceStep(span: number, count: number): number {
  const raw = span / Math.max(1, count);
  const power = 10 ** Math.floor(Math.log10(raw));
  const fraction = raw / power;
  const nice = fraction < Math.SQRT2 ? 1 : fraction < Math.sqrt(5) ? 2 : fraction < Math.sqrt(12.5) ? 2.5 : fraction < Math.sqrt(50) ? 5 : 10;
  return nice * power;
}

export interface ValueScale {
  min: number;
  max: number;
  ticks: number[];
  /** Where a value sits between min (0) and max (1). */
  ratio: (value: number) => number;
}

export interface ValueScaleOptions {
  /** Bars and areas grow from zero, so zero is always on the axis. @default true */
  includeZero?: boolean;
  /** About how many steps between ticks. @default 4 */
  count?: number;
  /** Fixed ends instead of round ones around the data. */
  domain?: readonly [number, number];
}

/** The value axis: round ends that hold every value, and the ticks between them. */
export function valueScale(values: readonly number[], { includeZero = true, count = 4, domain }: ValueScaleOptions = {}): ValueScale {
  let min: number;
  let max: number;
  let step: number;
  if (domain) {
    [min, max] = domain[0] < domain[1] ? domain : [domain[0], domain[0] + 1];
    step = niceStep(max - min, count);
  } else {
    const finite = values.filter(Number.isFinite);
    let low = finite.length ? Math.min(...finite) : 0;
    let high = finite.length ? Math.max(...finite) : 1;
    if (includeZero) {
      low = Math.min(0, low);
      high = Math.max(0, high);
    }
    if (low === high) high = low + (low === 0 ? 1 : Math.abs(low));
    step = niceStep(high - low, count);
    min = Math.floor(low / step) * step;
    max = Math.ceil(high / step) * step;
  }
  // Steps like 0.1 add up to 0.30000000000000004: round each tick to the step's own decimals.
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 1);
  const ticks: number[] = [];
  for (let tick = Math.ceil(min / step) * step; tick <= max + step / 1e6; tick += step) {
    ticks.push(Number(tick.toFixed(decimals)) + 0);
  }
  const span = max - min;
  return { min, max, ticks, ratio: (value) => (value - min) / span };
}

/** For each series, where its segment of a stacked bar or area starts and ends at each index. */
export function stack(columns: readonly (readonly (number | null)[])[]): [start: number, end: number][][] {
  const length = Math.max(0, ...columns.map((column) => column.length));
  const up = Array.from({ length }, () => 0);
  const down = Array.from({ length }, () => 0);
  // Positive values pile up from zero, negative ones down from it: a negative never hides under a positive.
  return columns.map((column) =>
    Array.from({ length }, (_, index) => {
      const value = column[index] ?? 0;
      const base = value < 0 ? down : up;
      const start = base[index]!;
      base[index] = start + value;
      return [start, start + value];
    }),
  );
}
