import * as React from "react";
import { tv } from "../../utils/tv";
import { useCenngeDefaults } from "../../provider";
import type { CenngeColor, CenngeRadius, CenngeSize } from "../../types";

export type BadgeVariant = "solid" | "flat" | "bordered" | "faded" | "dot";

const colorVariants: Record<BadgeVariant, Record<CenngeColor, string>> = {
  solid: {
    default: "bg-default text-default-foreground",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-danger text-danger-foreground",
    info: "bg-info text-info-foreground",
  },
  flat: {
    default: "bg-default-bg text-default-text",
    primary: "bg-primary-bg text-primary-text",
    secondary: "bg-secondary-bg text-secondary-text",
    success: "bg-success-bg text-success-text",
    warning: "bg-warning-bg text-warning-text",
    danger: "bg-danger-bg text-danger-text",
    info: "bg-info-bg text-info-text",
  },
  bordered: {
    default: "border-border text-default-text",
    primary: "border-primary text-primary-text",
    secondary: "border-secondary text-secondary-text",
    success: "border-success text-success-text",
    warning: "border-warning text-warning-text",
    danger: "border-danger text-danger-text",
    info: "border-info text-info-text",
  },
  faded: {
    default: "text-default-text",
    primary: "text-primary-text",
    secondary: "text-secondary-text",
    success: "text-success-text",
    warning: "text-warning-text",
    danger: "text-danger-text",
    info: "text-info-text",
  },
  dot: {
    default: "",
    primary: "",
    secondary: "",
    success: "",
    warning: "",
    danger: "",
    info: "",
  },
};

const dotColors: Record<CenngeColor, string> = {
  default: "bg-default-400",
  primary: "bg-primary",
  secondary: "bg-secondary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

export const badge = tv({
  base: "inline-flex max-w-full items-center gap-1.5 font-semibold whitespace-nowrap",
  variants: {
    variant: {
      solid: "",
      flat: "",
      bordered: "border-[1.5px] bg-transparent",
      faded: "border-[1.5px] border-border bg-surface-2",
      dot: "border-[1.5px] border-border bg-transparent text-foreground",
    },
    color: { default: "", primary: "", secondary: "", success: "", warning: "", danger: "", info: "" },
    size: {
      sm: "h-5 px-1.5 text-[11px]",
      md: "h-6 px-2 text-xs",
      lg: "h-7 px-2.5 text-sm",
    },
    radius: {
      none: "rounded-none",
      sm: "rounded-[0.375rem]",
      md: "rounded-small",
      lg: "rounded-medium",
      full: "rounded-full",
    },
  },
  compoundVariants: (Object.keys(colorVariants) as BadgeVariant[]).flatMap((variant) =>
    (Object.keys(colorVariants[variant]) as CenngeColor[]).map((color) => ({
      variant,
      color,
      class: colorVariants[variant][color],
    })),
  ),
  defaultVariants: { variant: "flat", color: "default", size: "md", radius: "full" },
});

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** @default "default" */
  color?: CenngeColor;
  /** @default "flat" */
  variant?: BadgeVariant;
  /** @default "md" */
  size?: CenngeSize;
  /** @default "full" */
  radius?: CenngeRadius;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(props, ref) {
  const defaults = useCenngeDefaults();
  const {
    color = defaults.color ?? "default",
    variant = "flat",
    size = defaults.size ?? "md",
    radius = "full",
    startContent,
    endContent,
    className,
    children,
    ...rest
  } = props;

  return (
    <span ref={ref} className={badge({ color, variant, size, radius, className })} {...rest}>
      {variant === "dot" ? <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${dotColors[color]}`} /> : null}
      {startContent}
      <span className="truncate">{children}</span>
      {endContent}
    </span>
  );
});
