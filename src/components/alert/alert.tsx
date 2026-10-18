import * as React from "react";
import { tv } from "../../utils/tv";
import type { CenngeColor, CenngeRadius } from "../../types";

export type AlertVariant = "flat" | "bordered" | "faded" | "solid";

const colorVariants: Record<AlertVariant, Record<CenngeColor, string>> = {
  flat: {
    default: "bg-default-bg text-foreground",
    primary: "bg-primary-bg text-primary-text",
    secondary: "bg-secondary-bg text-secondary-text",
    success: "bg-success-bg text-success-text",
    warning: "bg-warning-bg text-warning-text",
    danger: "bg-danger-bg text-danger-text",
    info: "bg-info-bg text-info-text",
  },
  bordered: {
    default: "border-border text-foreground",
    primary: "border-primary text-primary-text",
    secondary: "border-secondary text-secondary-text",
    success: "border-success text-success-text",
    warning: "border-warning text-warning-text",
    danger: "border-danger text-danger-text",
    info: "border-info text-info-text",
  },
  faded: {
    default: "text-foreground",
    primary: "text-primary-text",
    secondary: "text-secondary-text",
    success: "text-success-text",
    warning: "text-warning-text",
    danger: "text-danger-text",
    info: "text-info-text",
  },
  solid: {
    default: "bg-default text-default-foreground",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-danger text-danger-foreground",
    info: "bg-info text-info-foreground",
  },
};

const alert = tv({
  slots: {
    base: "relative flex w-full items-start gap-3 p-4 text-sm",
    icon: "mt-0.5 flex shrink-0 items-center",
    content: "flex min-w-0 flex-1 flex-col gap-0.5",
    title: "leading-5 font-semibold",
    description: "leading-5 opacity-85",
    close: [
      "-mt-1 -mr-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full",
      "opacity-70 transition hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10",
      "outline-none focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-ring",
    ],
  },
  variants: {
    variant: {
      flat: {},
      bordered: { base: "border-[1.5px] bg-transparent" },
      faded: { base: "border-[1.5px] border-border bg-surface-2" },
      solid: { base: "inset-shadow-tactile shadow-raised", description: "opacity-90" },
    },
    color: { default: {}, primary: {}, secondary: {}, success: {}, warning: {}, danger: {}, info: {} },
    radius: {
      none: { base: "rounded-none" },
      sm: { base: "rounded-small" },
      md: { base: "rounded-medium" },
      lg: { base: "rounded-large" },
      full: { base: "rounded-[1.5rem]" },
    },
  },
  compoundVariants: (Object.keys(colorVariants) as AlertVariant[]).flatMap((variant) =>
    (Object.keys(colorVariants[variant]) as CenngeColor[]).map((color) => ({
      variant,
      color,
      class: { base: colorVariants[variant][color] },
    })),
  ),
  defaultVariants: { variant: "flat", color: "default", radius: "md" },
});

const iconPaths: Record<CenngeColor, string> = {
  default: "M12 16v-4M12 8h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z",
  primary: "M12 16v-4M12 8h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z",
  secondary: "M12 16v-4M12 8h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z",
  info: "M12 16v-4M12 8h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z",
  success: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zM8 12.5l2.5 2.5L16 9.5",
  warning: "M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
  danger: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zM15 9l-6 6M9 9l6 6",
};

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "color"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** @default "default" */
  color?: CenngeColor;
  /** @default "flat" */
  variant?: AlertVariant;
  /** @default "md" */
  radius?: CenngeRadius;
  /** Replace the colour's icon; `false` hides it. */
  icon?: React.ReactNode | false;
  /** Extra content on the right, e.g. a Button. */
  endContent?: React.ReactNode;
  /** Shows a close button that calls `onClose`. */
  isClosable?: boolean;
  onClose?: () => void;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    title,
    description,
    color = "default",
    variant = "flat",
    radius = "md",
    icon,
    endContent,
    isClosable = false,
    onClose,
    className,
    children,
    ...rest
  },
  ref,
) {
  const slots = alert({ color, variant, radius });
  // Danger and warning interrupt; the rest are polite status messages.
  const role = color === "danger" || color === "warning" ? "alert" : "status";

  return (
    <div ref={ref} role={role} className={slots.base({ class: className })} {...rest}>
      {icon === false ? null : (
        <span className={slots.icon()}>
          {icon ?? (
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d={iconPaths[color]} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      )}
      <div className={slots.content()}>
        {title ? <div className={slots.title()}>{title}</div> : null}
        {description ? <div className={slots.description()}>{description}</div> : null}
        {children}
      </div>
      {endContent}
      {isClosable ? (
        <button type="button" aria-label="Close" onClick={onClose} className={slots.close()}>
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </div>
  );
});
