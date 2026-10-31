import { tv } from "../../utils/tv";
import type { CenngeColor, CenngeVariant } from "../../types";

/*
 * Class strings must stay literal: Tailwind finds them by scanning the shipped files,
 * so never build them with template strings like `bg-${color}`.
 */
const colorVariants: Record<CenngeVariant, Record<CenngeColor, string>> = {
  solid: {
    default: "bg-default text-default-foreground",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-danger text-danger-foreground",
    info: "bg-info text-info-foreground",
  },
  shadow: {
    default: "bg-default text-default-foreground shadow-lg shadow-default-500/30",
    primary: "bg-primary text-primary-foreground shadow-lg shadow-primary/40",
    secondary: "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/40",
    success: "bg-success text-success-foreground shadow-lg shadow-success/40",
    warning: "bg-warning text-warning-foreground shadow-lg shadow-warning/40",
    danger: "bg-danger text-danger-foreground shadow-lg shadow-danger/40",
    info: "bg-info text-info-foreground shadow-lg shadow-info/40",
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
  flat: {
    default: "bg-default-bg text-default-text not-data-[loading]:hover:bg-default-highlight",
    primary: "bg-primary-bg text-primary-text not-data-[loading]:hover:bg-primary-highlight",
    secondary: "bg-secondary-bg text-secondary-text not-data-[loading]:hover:bg-secondary-highlight",
    success: "bg-success-bg text-success-text not-data-[loading]:hover:bg-success-highlight",
    warning: "bg-warning-bg text-warning-text not-data-[loading]:hover:bg-warning-highlight",
    danger: "bg-danger-bg text-danger-text not-data-[loading]:hover:bg-danger-highlight",
    info: "bg-info-bg text-info-text not-data-[loading]:hover:bg-info-highlight",
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
  light: {
    default: "text-default-text not-data-[loading]:hover:bg-default-bg",
    primary: "text-primary-text not-data-[loading]:hover:bg-primary-bg",
    secondary: "text-secondary-text not-data-[loading]:hover:bg-secondary-bg",
    success: "text-success-text not-data-[loading]:hover:bg-success-bg",
    warning: "text-warning-text not-data-[loading]:hover:bg-warning-bg",
    danger: "text-danger-text not-data-[loading]:hover:bg-danger-bg",
    info: "text-info-text not-data-[loading]:hover:bg-info-bg",
  },
  ghost: {
    default: "border-border text-default-text not-data-[loading]:hover:bg-default-highlight not-data-[loading]:hover:text-default-foreground",
    primary: "border-primary text-primary-text not-data-[loading]:hover:bg-primary not-data-[loading]:hover:text-primary-foreground",
    secondary: "border-secondary text-secondary-text not-data-[loading]:hover:bg-secondary not-data-[loading]:hover:text-secondary-foreground",
    success: "border-success text-success-text not-data-[loading]:hover:bg-success not-data-[loading]:hover:text-success-foreground",
    warning: "border-warning text-warning-text not-data-[loading]:hover:bg-warning not-data-[loading]:hover:text-warning-foreground",
    danger: "border-danger text-danger-text not-data-[loading]:hover:bg-danger not-data-[loading]:hover:text-danger-foreground",
    info: "border-info text-info-text not-data-[loading]:hover:bg-info not-data-[loading]:hover:text-info-foreground",
  },
};

const compoundVariants = (Object.keys(colorVariants) as CenngeVariant[]).flatMap((variant) =>
  (Object.keys(colorVariants[variant]) as CenngeColor[]).map((color) => ({
    variant,
    color,
    class: colorVariants[variant][color],
  })),
);

export const button = tv({
  base: [
    "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden",
    "font-semibold whitespace-nowrap select-none",
    "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
    // Tactile press. Only transform and colour transitions — no layout properties.
    "transition-[transform,color,background-color,border-color,box-shadow,filter]",
    "duration-(--cennge-duration-fast) ease-tactile motion-reduce:transition-none",
    "not-data-[loading]:active:scale-[0.97]",
    "data-[disabled]:opacity-(--cennge-disabled-opacity) data-[disabled]:not-data-[loading]:pointer-events-none",
    // A loading button keeps the pointer, or its wait cursor would never show; hover and press stay off.
    "data-[loading]:cursor-wait",
  ],
  variants: {
    variant: {
      solid: "inset-shadow-tactile shadow-raised not-data-[loading]:hover:brightness-110",
      shadow: "inset-shadow-tactile not-data-[loading]:hover:brightness-110",
      bordered: "border-2 bg-transparent not-data-[loading]:hover:bg-default-bg",
      flat: "",
      faded: "border-2 border-border bg-surface-2 not-data-[loading]:hover:bg-default-bg",
      light: "bg-transparent",
      ghost: "border-2 bg-transparent",
    },
    color: {
      default: "",
      primary: "",
      secondary: "",
      success: "",
      warning: "",
      danger: "",
      info: "",
    },
    size: {
      sm: "h-8 min-w-16 px-3 text-xs",
      md: "h-10 min-w-20 px-4 text-sm",
      lg: "h-12 min-w-24 px-6 text-base",
    },
    radius: {
      none: "rounded-none",
      sm: "rounded-small",
      md: "rounded-medium",
      lg: "rounded-large",
      full: "rounded-full",
    },
    isIconOnly: {
      true: "min-w-0 px-0",
    },
    fullWidth: {
      true: "w-full",
    },
  },
  compoundVariants: [
    ...compoundVariants,
    { isIconOnly: true, size: "sm", class: "w-8" },
    { isIconOnly: true, size: "md", class: "w-10" },
    { isIconOnly: true, size: "lg", class: "w-12" },
  ],
  defaultVariants: {
    variant: "solid",
    color: "default",
    size: "md",
    radius: "md",
    isIconOnly: false,
    fullWidth: false,
  },
});
