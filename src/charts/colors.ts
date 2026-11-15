import type { CenngeColor, ChartColor } from "../types";

export type { ChartColor };

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
