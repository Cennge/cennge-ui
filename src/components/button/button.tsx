import * as React from "react";
import { Slot } from "radix-ui";
import { useCenngeDefaults } from "../../provider";
import type { CenngeColor, CenngeRadius, CenngeSize, CenngeVariant } from "../../types";
import { Spinner } from "./spinner";
import { button } from "./button.styles";

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  /** @default "default" */
  color?: CenngeColor;
  /** @default "solid" */
  variant?: CenngeVariant;
  /** @default "md" */
  size?: CenngeSize;
  /** @default "md" */
  radius?: CenngeRadius;
  /** Square button sized for a single icon. Give it an `aria-label`. */
  isIconOnly?: boolean;
  fullWidth?: boolean;
  isDisabled?: boolean;
  /** Shows a spinner in place of `startContent` and blocks interaction. */
  isLoading?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  /** Replaces the default spinner while `isLoading`. */
  spinner?: React.ReactNode;
  /** Render the child element (e.g. a router `<Link>`) with button styles and behaviour. */
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const defaults = useCenngeDefaults();
  const {
    color = defaults.color ?? "default",
    variant = "solid",
    size = defaults.size ?? "md",
    radius = defaults.radius ?? "md",
    isIconOnly = false,
    fullWidth = false,
    isDisabled: isDisabledProp = false,
    disabled,
    isLoading = false,
    startContent,
    endContent,
    spinner,
    asChild = false,
    type,
    className,
    children,
    ...rest
  } = props;

  const isDisabled = isDisabledProp || Boolean(disabled) || isLoading;
  const Comp = asChild ? Slot.Root : "button";
  const loader = spinner ?? <Spinner size={size} />;

  return (
    <Comp
      ref={ref}
      // A real <button> gets native disabled; anything else (links via asChild) gets aria-disabled.
      type={asChild ? undefined : (type ?? "button")}
      disabled={asChild ? undefined : isDisabled}
      aria-disabled={asChild && isDisabled ? true : undefined}
      aria-busy={isLoading || undefined}
      data-disabled={isDisabled || undefined}
      data-loading={isLoading || undefined}
      className={button({ color, variant, size, radius, isIconOnly, fullWidth, className })}
      {...rest}
    >
      {isIconOnly ? null : isLoading ? loader : startContent}
      {asChild ? (
        <Slot.Slottable>{children}</Slot.Slottable>
      ) : isIconOnly && isLoading ? (
        loader
      ) : (
        children
      )}
      {isIconOnly ? null : endContent}
    </Comp>
  );
});
