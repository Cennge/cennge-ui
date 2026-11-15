import type * as React from "react";
import { chartColor, type ChartColor } from "./colors";
import { defaultChartLabels, useNumberFormats, type ChartLabels, type ChartTableData, type LegendItem, type TooltipContent } from "./frame";

type Key<T> = Extract<keyof T, string>;

export interface ChartSeries<T> {
  /** The field of each item that holds this series' values. */
  key: Key<T>;
  /** Its name in the legend, the tooltip and the table. @default key */
  label?: string;
  /** @default the palette slot of its place in `series` */
  color?: ChartColor;
}

/** A LineChart series, which can also be drawn as dots. */
export interface LineChartSeries<T> extends ChartSeries<T> {
  /** "dots": each value a dot, with no line through them, for raw readings under a trend. @default "line" */
  display?: "line" | "dots";
}

/**
 * A value to read the data against, drawn across the plot: a dashed line at a goal (`value`) or a band
 * over a range (`from` to `to`), e.g. "Goal" at 2,000 or "Healthy" from 18.5 to 25.
 */
export type ChartReference =
  | { value: number; label?: string; color?: ChartColor }
  | { from: number; to: number; label?: string; color?: ChartColor };

/** A reference with its colour as CSS. */
export type ResolvedReference = ({ kind: "line"; value: number } | { kind: "band"; from: number; to: number }) & {
  label?: string;
  color: string;
};

export interface CartesianChartProps<T> {
  /** One item per category: a month, a repository… */
  data: readonly T[];
  /** The field that names each category, on the axis, in the tooltip and in the table. */
  index: Key<T>;
  series: readonly ChartSeries<T>[];
  /** Names the chart for screen readers, and the table that gives them its data. */
  "aria-label": string;
  /** What the categories are, heading the table's first column, e.g. "Month". @default index */
  indexLabel?: string;
  indexFormat?: (value: T[Key<T>], item: T) => string;
  /** Values in the tooltip and the table. @default numbers in the provider's locale */
  valueFormat?: (value: number) => string;
  /** Values on the axis. @default short numbers in the provider's locale (1.2K) */
  axisFormat?: (value: number) => string;
  /** The value axis' ends, instead of round ones around the data. */
  domain?: readonly [number, number];
  /** @default true with two or more series */
  showLegend?: boolean;
  /** @default true */
  showGrid?: boolean;
  /** The axis along the bottom. @default true */
  showXAxis?: boolean;
  /** The axis up the side. @default true */
  showYAxis?: boolean;
  labels?: Partial<ChartLabels>;
  /**
   * Goals and ranges drawn across the plot. The value axis stretches to show them, unless `domain` fixes
   * it: then a line outside it is left out and a band is cut at its edge (screen readers still hear both).
   */
  references?: readonly ChartReference[];
  /** Shown in place of the plot when there is no data. @default labels.empty */
  emptyContent?: React.ReactNode;
  /** Size it here: the default height, h-72, includes the axes and the legend. */
  className?: string;
}

const toNumber = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null);

/** What every chart with categories and series derives from its props, the same way. */
export function useCartesianData<T>(props: CartesianChartProps<T>, legendShape: LegendItem["shape"]) {
  const { data, index, series, indexLabel, indexFormat, valueFormat, axisFormat, showLegend } = props;
  const formats = useNumberFormats(valueFormat, axisFormat);
  const labels = { ...defaultChartLabels, ...props.labels };
  const categories = data.map((item) => (indexFormat ? indexFormat(item[index], item) : String(item[index])));
  const columns = series.map((entry) => data.map((item) => toNumber(item[entry.key])));
  const names = series.map((entry) => entry.label ?? entry.key);
  const colors = series.map((entry, i) => chartColor(entry.color, i));
  const show = (value: number | null) => (value === null ? "–" : formats.value(value));

  // A LineChart series drawn as dots shows a dot wherever it is keyed; on other charts there is no such series.
  const shapeOf = (entry: ChartSeries<T>): LegendItem["shape"] =>
    legendShape === "line" && (entry as LineChartSeries<T>).display === "dots" ? "dot" : legendShape;
  const legend: LegendItem[] | null =
    (showLegend ?? series.length > 1)
      ? series.map((entry, i) => ({
          key: entry.key,
          label: names[i]!,
          color: colors[i]!,
          shape: shapeOf(entry),
        }))
      : null;
  const references: ResolvedReference[] = (props.references ?? []).map((reference) => {
    const color = chartColor(reference.color ?? "default", 0);
    return "value" in reference
      ? { kind: "line", value: reference.value, label: reference.label, color }
      : { kind: "band", from: Math.min(reference.from, reference.to), to: Math.max(reference.from, reference.to), label: reference.label, color };
  });
  // Each reference's ends, so the value axis reaches them.
  const referenceValues = references.flatMap((reference) => (reference.kind === "line" ? [reference.value] : [reference.from, reference.to]));
  const table: ChartTableData = {
    columns: [indexLabel ?? index, ...names],
    rows: categories.map((category, i) => [category, ...columns.map((column) => show(column[i]!))]),
  };
  const tooltip = (i: number): TooltipContent => ({
    title: categories[i] ?? "",
    rows: series.map((entry, s) => ({ key: entry.key, label: names[s]!, value: show(columns[s]![i]!), color: colors[s]!, shape: shapeOf(entry) })),
  });
  return { categories, columns, colors, formats, labels, legend, table, tooltip, references, referenceValues };
}
