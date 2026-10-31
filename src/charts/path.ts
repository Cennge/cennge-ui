export type Point = readonly [x: number, y: number];

const n = (value: number) => Math.round(value * 100) / 100;

/** Runs of places without a gap, as indices: a missing value breaks a line instead of pulling it to zero. */
export function runs(isPresent: readonly boolean[]): number[][] {
  const result: number[][] = [];
  let run: number[] = [];
  isPresent.forEach((present, index) => {
    if (present) run.push(index);
    else if (run.length) {
      result.push(run);
      run = [];
    }
  });
  if (run.length) result.push(run);
  return result;
}

/*
 * Tangents for a smooth curve that never overshoots its points (monotone cubic, as in PCHIP): zero at a
 * peak or a dip, so a curve between two equal values stays flat and a count never dips below zero.
 */
function tangents(points: readonly Point[]): number[] {
  const count = points.length;
  const secants = points.slice(1).map(([x, y], i) => {
    const [px, py] = points[i]!;
    return x === px ? 0 : (y - py) / (x - px);
  });
  return points.map(([x], i) => {
    if (i === 0) return secants[0] ?? 0;
    if (i === count - 1) return secants[i - 1] ?? 0;
    const [before, after] = [secants[i - 1]!, secants[i]!];
    if (before * after <= 0) return 0;
    // A weighted harmonic mean of the two secants.
    const h0 = x - points[i - 1]![0];
    const h1 = points[i + 1]![0] - x;
    const w1 = 2 * h1 + h0;
    const w2 = h1 + 2 * h0;
    return (w1 + w2) / (w1 / before + w2 / after);
  });
}

/** The commands after the first point: straight segments or cubic curves. */
function through(points: readonly Point[], curve: "linear" | "smooth"): string {
  if (curve === "linear" || points.length < 3) return points.slice(1).map(([x, y]) => `L${n(x)},${n(y)}`).join("");
  const m = tangents(points);
  return points
    .slice(1)
    .map(([x, y], i) => {
      const [px, py] = points[i]!;
      const third = (x - px) / 3;
      return `C${n(px + third)},${n(py + m[i]! * third)},${n(x - third)},${n(y - m[i + 1]! * third)},${n(x)},${n(y)}`;
    })
    .join("");
}

/** An SVG path through the points, left to right: straight, or a smooth curve that keeps to them. */
export function linePath(points: readonly Point[], curve: "linear" | "smooth" = "linear"): string {
  if (points.length === 0) return "";
  const [x, y] = points[0]!;
  return `M${n(x)},${n(y)}${through(points, curve)}`;
}

/**
 * The area between a line and its floor: the baseline, or the line below it in a stack. Both run left to
 * right with the same x; the floor is traced back right to left.
 */
export function areaPath(top: readonly Point[], floor: readonly Point[], curve: "linear" | "smooth" = "linear"): string {
  if (top.length === 0) return "";
  // The floor curve is the same curve read backwards: build it forwards, then reverse its segments.
  const back = linePath(floor, curve);
  const reversed = reverse(back, floor);
  const [fx, fy] = floor[floor.length - 1]!;
  return `${linePath(top, curve)}L${n(fx)},${n(fy)}${reversed}Z`;
}

/** A path's commands after its first point, traced from its last point back to its first. */
function reverse(path: string, points: readonly Point[]): string {
  const commands = path.match(/[LC][^LC]*/g) ?? [];
  return commands
    .map((command, i) => {
      const [x, y] = points[i]!;
      if (command[0] === "L") return `L${n(x)},${n(y)}`;
      const [c1x, c1y, c2x, c2y] = command.slice(1).split(",").map(Number);
      return `C${c2x},${c2y},${c1x},${c1y},${n(x)},${n(y)}`;
    })
    .reverse()
    .join("");
}

/** Where a bar's data end is: up and down for columns, left and right for bars. */
export type BarEnd = "top" | "bottom" | "left" | "right";

/** A bar square where it grows from and rounded at its data end, the rest of a box (x, y, width, height). */
export function barPath(x: number, y: number, width: number, height: number, radius: number, end: BarEnd): string {
  const across = end === "top" || end === "bottom" ? width : height;
  const along = end === "top" || end === "bottom" ? height : width;
  const r = Math.max(0, Math.min(radius, across / 2, along));
  const [x1, y1] = [x + width, y + height];
  if (r === 0) return `M${n(x)},${n(y)}H${n(x1)}V${n(y1)}H${n(x)}Z`;
  const arc = (toX: number, toY: number) => `A${n(r)},${n(r)},0,0,1,${n(toX)},${n(toY)}`;
  switch (end) {
    case "top":
      return `M${n(x)},${n(y1)}V${n(y + r)}${arc(x + r, y)}H${n(x1 - r)}${arc(x1, y + r)}V${n(y1)}Z`;
    case "bottom":
      return `M${n(x1)},${n(y)}V${n(y1 - r)}${arc(x1 - r, y1)}H${n(x + r)}${arc(x, y1 - r)}V${n(y)}Z`;
    case "right":
      return `M${n(x)},${n(y)}H${n(x1 - r)}${arc(x1, y + r)}V${n(y1 - r)}${arc(x1 - r, y1)}H${n(x)}Z`;
    case "left":
      return `M${n(x1)},${n(y1)}H${n(x + r)}${arc(x, y1 - r)}V${n(y + r)}${arc(x + r, y)}H${n(x1)}Z`;
  }
}

const TAU = Math.PI * 2;
/** A point on a circle, the angle in radians clockwise from 12 o'clock. */
const at = (cx: number, cy: number, radius: number, angle: number): Point => [cx + radius * Math.sin(angle), cy - radius * Math.cos(angle)];

/**
 * A segment of a ring (a pie slice when `inner` is 0), from angle `start` to `end` in radians clockwise
 * from 12 o'clock. `gap` pixels are left on each side between neighbours, as wide at the hole as at the rim.
 */
export function arcPath(cx: number, cy: number, outer: number, inner: number, start: number, end: number, gap = 0): string {
  if (end - start >= TAU - 1e-9) {
    // A full ring cannot be one arc: two halves, and the hole cut out by the even-odd rule.
    const ring = (r: number) =>
      `M${n(cx)},${n(cy - r)}A${n(r)},${n(r)},0,1,1,${n(cx)},${n(cy + r)}A${n(r)},${n(r)},0,1,1,${n(cx)},${n(cy - r)}Z`;
    return inner > 0 ? ring(outer) + ring(inner) : ring(outer);
  }
  // The same width of gap at both radii needs a wider angle at the smaller one.
  const pad = (r: number) => (r > 0 ? Math.min(gap / 2 / r, (end - start) / 2) : 0);
  const [o0, o1] = [start + pad(outer), end - pad(outer)];
  const large = o1 - o0 > Math.PI ? 1 : 0;
  const [ax, ay] = at(cx, cy, outer, o0);
  const [bx, by] = at(cx, cy, outer, o1);
  let path = `M${n(ax)},${n(ay)}A${n(outer)},${n(outer)},0,${large},1,${n(bx)},${n(by)}`;
  if (inner > 0) {
    const [i0, i1] = [start + pad(inner), end - pad(inner)];
    const [cxi, cyi] = at(cx, cy, inner, i1);
    const [dxi, dyi] = at(cx, cy, inner, i0);
    path += `L${n(cxi)},${n(cyi)}A${n(inner)},${n(inner)},0,${i1 - i0 > Math.PI ? 1 : 0},0,${n(dxi)},${n(dyi)}`;
  } else {
    path += `L${n(cx)},${n(cy)}`;
  }
  return `${path}Z`;
}
