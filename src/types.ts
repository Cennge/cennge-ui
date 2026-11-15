/** Shared prop vocabularies. Public API: kept independent of Radix and tailwind-variants types. */

export type CenngeColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info";

export type CenngeVariant = "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "ghost";

export type CenngeSize = "sm" | "md" | "lg";

/**
 * A colour for data: a slot of the chart palette, a theme colour, or any CSS colour.
 *
 * The palette's eight slots are told apart with every kind of colour blindness, next to each other in the
 * order given, in both themes, and the first follows the accent. Theme colours are for series that mean
 * something (failures in `danger`); "default" is the grey for everything else.
 */
export type ChartColor = `chart-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}` | CenngeColor | (string & {});

export type CenngeRadius = "none" | "sm" | "md" | "lg" | "full";
