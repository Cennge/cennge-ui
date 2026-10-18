import { tv } from "../../utils/tv";
import type { CenngeColor } from "../../types";

export type InputVariant = "flat" | "bordered" | "faded" | "underlined";

/*
 * Focus colour per `color`. Literal strings so Tailwind can find them.
 * data-[state=open] covers Select: while its list is open, focus is in the list, not in the field.
 */
const focusColors: Record<CenngeColor, string> = {
  default:
    "focus-within:border-default-400 focus-within:ring-default-500/25 data-[state=open]:border-default-400 data-[state=open]:ring-default-500/25",
  primary:
    "focus-within:border-primary focus-within:ring-primary/30 data-[state=open]:border-primary data-[state=open]:ring-primary/30",
  secondary:
    "focus-within:border-secondary focus-within:ring-secondary/30 data-[state=open]:border-secondary data-[state=open]:ring-secondary/30",
  success:
    "focus-within:border-success focus-within:ring-success/30 data-[state=open]:border-success data-[state=open]:ring-success/30",
  warning:
    "focus-within:border-warning focus-within:ring-warning/30 data-[state=open]:border-warning data-[state=open]:ring-warning/30",
  danger:
    "focus-within:border-danger focus-within:ring-danger/30 data-[state=open]:border-danger data-[state=open]:ring-danger/30",
  info: "focus-within:border-info focus-within:ring-info/30 data-[state=open]:border-info data-[state=open]:ring-info/30",
};

export const input = tv({
  slots: {
    base: "group flex w-full flex-col gap-1.5 data-[disabled]:opacity-(--cennge-disabled-opacity)",
    label: [
      "text-sm font-medium text-foreground",
      "group-data-[required]:after:ml-0.5 group-data-[required]:after:text-danger-text group-data-[required]:after:content-['*']",
    ],
    inputWrapper: [
      "relative flex w-full cursor-text items-center gap-2 px-3",
      "transition-[background-color,border-color,box-shadow] duration-(--cennge-duration-fast) ease-tactile motion-reduce:transition-none",
      "group-data-[disabled]:cursor-not-allowed",
    ],
    input: [
      "h-full w-full min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted",
      "disabled:cursor-not-allowed [&::-ms-reveal]:hidden [&::-webkit-search-cancel-button]:hidden",
    ],
    clearButton: [
      "-mr-1 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted",
      "transition-colors hover:bg-default-bg hover:text-foreground",
      "outline-none focus-visible:outline-2 focus-visible:outline-ring",
    ],
    description: "text-xs text-muted",
    errorMessage: "text-xs text-danger-text",
  },
  variants: {
    variant: {
      flat: { inputWrapper: "bg-surface-3 hover:bg-surface-4 focus-within:bg-surface-4 focus-within:ring-2" },
      bordered: { inputWrapper: "border-2 border-border bg-transparent hover:border-default-400 focus-within:ring-2" },
      faded: { inputWrapper: "border-2 border-border bg-surface-2 hover:border-default-400 focus-within:ring-2" },
      underlined: { inputWrapper: "rounded-none! border-b-2 border-border px-1 focus-within:ring-0" },
    },
    color: {
      default: { inputWrapper: focusColors.default },
      primary: { inputWrapper: focusColors.primary },
      secondary: { inputWrapper: focusColors.secondary },
      success: { inputWrapper: focusColors.success },
      warning: { inputWrapper: focusColors.warning },
      danger: { inputWrapper: focusColors.danger },
      info: { inputWrapper: focusColors.info },
    },
    size: {
      sm: { inputWrapper: "h-8 text-xs", input: "text-xs" },
      md: { inputWrapper: "h-10 text-sm", input: "text-sm" },
      lg: { inputWrapper: "h-12 text-base", input: "text-base" },
    },
    radius: {
      none: { inputWrapper: "rounded-none" },
      sm: { inputWrapper: "rounded-small" },
      md: { inputWrapper: "rounded-medium" },
      lg: { inputWrapper: "rounded-large" },
      full: { inputWrapper: "rounded-full px-4" },
    },
    isInvalid: { true: {} },
  },
  compoundVariants: [
    // Last, so it wins over the colour's focus classes.
    {
      isInvalid: true,
      class: {
        inputWrapper:
          "border-danger bg-danger-bg hover:border-danger focus-within:border-danger focus-within:ring-danger/30 data-[state=open]:border-danger data-[state=open]:ring-danger/30",
        label: "text-danger-text",
      },
    },
  ],
  defaultVariants: { variant: "flat", color: "primary", size: "md", radius: "md", isInvalid: false },
});
