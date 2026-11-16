import * as React from "react";
import { Slot } from "radix-ui";
import { tv } from "../../utils/tv";
import type { CenngeColor } from "../../types";

const fab = tv({
  slots: {
    base: [
      "z-30 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-large font-semibold select-none",
      "inset-shadow-tactile shadow-floating outline-none [-webkit-tap-highlight-color:transparent]",
      "transition-[transform,background-color,box-shadow,padding] duration-(--cennge-duration) ease-tactile motion-reduce:transition-none",
      "active:scale-95 hover:brightness-110",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring",
      "disabled:cursor-not-allowed disabled:opacity-(--cennge-disabled-opacity) aria-disabled:cursor-not-allowed aria-disabled:opacity-(--cennge-disabled-opacity)",
      "forced-colors:border forced-colors:border-[ButtonText]",
    ],
    icon: "flex shrink-0 items-center justify-center",
    // The label folds into the button and out again: a grid track from nothing to its width.
    fold: [
      "grid grid-cols-[0fr] transition-[grid-template-columns] duration-(--cennge-duration) ease-tactile motion-reduce:transition-none",
      "data-[extended]:grid-cols-[1fr]",
    ],
    label: "overflow-hidden pl-2 whitespace-nowrap",
  },
  variants: {
    size: {
      md: { base: "h-14 min-w-14 text-sm", icon: "[&_svg]:size-6" },
      lg: { base: "h-24 min-w-24 rounded-[1.75rem] text-base", icon: "[&_svg]:size-9" },
    },
    isExtended: { true: { base: "px-5" }, false: { base: "px-4" } },
    color: {
      default: { base: "bg-default text-default-foreground" },
      primary: { base: "bg-primary text-primary-foreground" },
      secondary: { base: "bg-secondary text-secondary-foreground" },
      success: { base: "bg-success text-success-foreground" },
      warning: { base: "bg-warning text-warning-foreground" },
      danger: { base: "bg-danger text-danger-foreground" },
      info: { base: "bg-info text-info-foreground" },
    },
    position: {
      fixed: { base: "fixed" },
      static: { base: "relative" },
    },
  },
  compoundVariants: [{ size: "lg", isExtended: false, class: { base: "px-7" } }],
  defaultVariants: { size: "md", isExtended: false, color: "primary", position: "fixed" },
});

export interface FloatingActionButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "children"> {
  /** The icon: a plus, a pencil. */
  icon: React.ReactNode;
  /** What it does, "Log a meal". Shown beside the icon when extended; otherwise its name for screen readers. */
  label: string;
  /** Show the label beside the icon. It folds in and out, so it can collapse as the page scrolls and come back. */
  isExtended?: boolean;
  /** 56 or 96 pixels high. @default "md" */
  size?: "md" | "lg";
  /** @default "primary" */
  color?: CenngeColor;
  /**
   * "fixed" pins it at the bottom right, above a fixed BottomNavigation and BottomBar and clear of the
   * screen's rounded corners; "static" leaves it in the flow. @default "fixed"
   */
  position?: "fixed" | "static";
  isDisabled?: boolean;
  /** Render your link as the button; give it no children of its own. */
  asChild?: boolean;
  children?: React.ReactElement;
  classNames?: Partial<Record<"base" | "icon" | "label", string>>;
}

/**
 * The one action a screen is about, floating at the bottom right in reach of a thumb: "Log", "Start
 * workout". It opens a menu or a sheet as a trigger (it forwards its ref), or does the action itself.
 */
export const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(function FloatingActionButton(
  {
    icon,
    label,
    isExtended = false,
    size = "md",
    color = "primary",
    position = "fixed",
    isDisabled = false,
    asChild = false,
    className,
    classNames,
    style,
    onClickCapture,
    children,
    ...rest
  },
  ref,
) {
  const slots = fab({ size, isExtended, color, position });
  const Comp = asChild ? Slot.Root : "button";
  // A link cannot be disabled: its clicks are stopped instead, as Button does.
  const blockClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : "button"}
      disabled={asChild ? undefined : isDisabled}
      aria-disabled={asChild && isDisabled ? true : undefined}
      aria-label={isExtended ? undefined : label}
      data-slot="fab"
      className={slots.base({ class: [classNames?.base, className] })}
      style={
        position === "fixed"
          ? {
              right: "calc(1rem + env(safe-area-inset-right, 0px))",
              // Above the bottom stack, whose heights include the home indicator; above the indicator alone without it.
              bottom: "calc(1rem + max(var(--cennge-bottom-nav, 0px) + var(--cennge-bottom-bar, 0px), env(safe-area-inset-bottom, 0px)))",
              ...style,
            }
          : style
      }
      onClickCapture={asChild && isDisabled ? blockClick : onClickCapture}
      {...rest}
    >
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : null}
      <span aria-hidden="true" className={slots.icon({ class: classNames?.icon })}>
        {icon}
      </span>
      <span aria-hidden={isExtended ? undefined : true} data-extended={isExtended ? "" : undefined} className={slots.fold()}>
        <span className={slots.label({ class: classNames?.label })}>{label}</span>
      </span>
    </Comp>
  );
});
