import type { CenngeColor } from "../types";

/**
 * A series colour: a slot of the chart palette, a theme colour, or any CSS colour.
 *
 * The palette's eight slots are told apart with every kind of colour blindness, next to each other in the
 * order given, in both themes, and the first follows the accent. Theme colours are for series that mean
 * something (failures in `danger`); "default" is the grey for everything else.
 */
export type ChartColor = `chart-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}` | CenngeColor | (string & {});

const themeColors: ReadonlySet<string> = new Set<CenngeColor>(["primary", "secondary", "success", "warning", "danger", "info"]);

/**
 * The CSS value of a series colour. Without one, a series takes the palette slot of its place: series keep
 * their colour when others are added after them. Past the eighth they are grey, never a colour again.
 */
export function chartColor(color: ChartColor | undefined, index: number): string {
  if (color === undefined) return index < 8 ? `var(--cennge-chart-${index + 1})` : "var(--cennge-default-500)";
  if (color === "default") return "var(--cennge-default-500)";
  if (/^chart-[1-8]$/.test(color) || themeColors.has(color)) return `var(--cennge-${color})`;
  return color;
}
