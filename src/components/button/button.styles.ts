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
    default: "bg-default-bg text-default-text hover:bg-default-highlight",
    primary: "bg-primary-bg text-primary-text hover:bg-primary-highlight",
    secondary: "bg-secondary-bg text-secondary-text hover:bg-secondary-highlight",
    success: "bg-success-bg text-success-text hover:bg-success-highlight",
    warning: "bg-warning-bg text-warning-text hover:bg-warning-highlight",
    danger: "bg-danger-bg text-danger-text hover:bg-danger-highlight",
    info: "bg-info-bg text-info-text hover:bg-info-highlight",
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
    default: "text-default-text hover:bg-default-bg",
    primary: "text-primary-text hover:bg-primary-bg",
    secondary: "text-secondary-text hover:bg-secondary-bg",
    success: "text-success-text hover:bg-success-bg",
    warning: "text-warning-text hover:bg-warning-bg",
    danger: "text-danger-text hover:bg-danger-bg",
    info: "text-info-text hover:bg-info-bg",
  },
  ghost: {
    default: "border-border text-default-text hover:bg-default hover:text-default-foreground",
    primary: "border-primary text-primary-text hover:bg-primary hover:text-primary-foreground",
    secondary: "border-secondary text-secondary-text hover:bg-secondary hover:text-secondary-foreground",
    success: "border-success text-success-text hover:bg-success hover:text-success-foreground",
    warning: "border-warning text-warning-text hover:bg-warning hover:text-warning-foreground",
    danger: "border-danger text-danger-text hover:bg-danger hover:text-danger-foreground",
    info: "border-info text-info-text hover:bg-info hover:text-info-foreground",
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
    "relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden",
    "font-semibold whitespace-nowrap select-none",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    // Tactile press. Only transform and colour transitions — no layout properties.
    "transition-[transform,color,background-color,border-color,box-shadow,filter]",
    "duration-(--cennge-duration-fast) ease-tactile motion-reduce:transition-none",
    "active:scale-[0.97]",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-(--cennge-disabled-opacity)",
    "data-[loading]:cursor-wait",
  ],
  variants: {
    variant: {
      solid: "inset-shadow-tactile shadow-raised hover:brightness-110",
      shadow: "inset-shadow-tactile hover:brightness-110",
      bordered: "border-2 bg-transparent hover:bg-surface-3",
      flat: "",
      faded: "border-2 border-border bg-surface-2 hover:bg-surface-3",
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
