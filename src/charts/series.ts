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

  const legend: LegendItem[] | null =
    (showLegend ?? series.length > 1) ? series.map((entry, i) => ({ key: entry.key, label: names[i]!, color: colors[i]!, shape: legendShape })) : null;
  const table: ChartTableData = {
    columns: [indexLabel ?? index, ...names],
    rows: categories.map((category, i) => [category, ...columns.map((column) => show(column[i]!))]),
  };
  const tooltip = (i: number): TooltipContent => ({
    title: categories[i] ?? "",
    rows: series.map((entry, s) => ({ key: entry.key, label: names[s]!, value: show(columns[s]![i]!), color: colors[s]! })),
  });
  return { categories, columns, colors, formats, labels, legend, table, tooltip };
}
