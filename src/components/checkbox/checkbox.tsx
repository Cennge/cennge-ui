import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { tv } from "../../utils/tv";
import { useCenngeDefaults } from "../../provider";
import { useId } from "../../utils/use-id";
import type { CenngeColor, CenngeSize } from "../../types";

const checkbox = tv({
  slots: {
    base: "group inline-flex items-start gap-2.5 data-[disabled]:opacity-(--cennge-disabled-opacity)",
    box: [
      "peer flex shrink-0 cursor-pointer items-center justify-center rounded-[0.375rem] border-2 border-default-400",
      "bg-transparent transition-[background-color,border-color,transform] duration-(--cennge-duration-fast) ease-tactile",
      "active:scale-90 motion-reduce:transition-none",
      "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
      "disabled:cursor-not-allowed",
    ],
    indicator: "flex items-center justify-center data-[state=checked]:animate-cennge-pop-in motion-reduce:animate-none",
    label: "cursor-pointer text-sm text-foreground select-none group-data-[disabled]:cursor-not-allowed",
  },
  variants: {
    size: {
      sm: { box: "mt-0.5 size-4", label: "text-xs leading-5" },
      md: { box: "mt-px size-5", label: "leading-6" },
      lg: { box: "size-6", label: "text-base leading-6" },
    },
    color: {
      default: {
        box: "data-[state=checked]:border-default-500 data-[state=checked]:bg-default-500 data-[state=checked]:text-white data-[state=indeterminate]:border-default-500 data-[state=indeterminate]:bg-default-500 data-[state=indeterminate]:text-white",
      },
      primary: {
        box: "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
      },
      secondary: {
        box: "data-[state=checked]:border-secondary data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground data-[state=indeterminate]:border-secondary data-[state=indeterminate]:bg-secondary data-[state=indeterminate]:text-secondary-foreground",
      },
      success: {
        box: "data-[state=checked]:border-success data-[state=checked]:bg-success data-[state=checked]:text-success-foreground data-[state=indeterminate]:border-success data-[state=indeterminate]:bg-success data-[state=indeterminate]:text-success-foreground",
      },
      warning: {
        box: "data-[state=checked]:border-warning data-[state=checked]:bg-warning data-[state=checked]:text-warning-foreground data-[state=indeterminate]:border-warning data-[state=indeterminate]:bg-warning data-[state=indeterminate]:text-warning-foreground",
      },
      danger: {
        box: "data-[state=checked]:border-danger data-[state=checked]:bg-danger data-[state=checked]:text-danger-foreground data-[state=indeterminate]:border-danger data-[state=indeterminate]:bg-danger data-[state=indeterminate]:text-danger-foreground",
      },
      info: {
        box: "data-[state=checked]:border-info data-[state=checked]:bg-info data-[state=checked]:text-info-foreground data-[state=indeterminate]:border-info data-[state=indeterminate]:bg-info data-[state=indeterminate]:text-info-foreground",
      },
    },
  },
  defaultVariants: { size: "md", color: "primary" },
});

export interface CheckboxProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "onChange" | "value" | "defaultValue"> {
  /** Label next to the box. Without it, pass `aria-label`. */
  children?: React.ReactNode;
  isSelected?: boolean;
  defaultSelected?: boolean;
  /** Shows a dash, e.g. for "select all" when only some rows are selected. */
  isIndeterminate?: boolean;
  onValueChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
  isRequired?: boolean;
  /** @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  name?: string;
  value?: string;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  {
    children,
    isSelected,
    defaultSelected,
    isIndeterminate = false,
    onValueChange,
    isDisabled = false,
    disabled,
    isRequired = false,
    color,
    size,
    className,
    id: idProp,
    ...rest
  },
  ref,
) {
  const defaults = useCenngeDefaults();
  const id = useId(idProp);
  const sizeValue = size ?? defaults.size ?? "md";
  const slots = checkbox({
    size: sizeValue,
    color: color ?? (defaults.color && defaults.color !== "default" ? defaults.color : "primary"),
  });
  const isOff = isDisabled || Boolean(disabled);
  const iconSize = sizeValue === "sm" ? "size-3" : sizeValue === "lg" ? "size-4" : "size-3.5";

  return (
    <div className={slots.base({ class: className })} data-disabled={isOff || undefined}>
      <CheckboxPrimitive.Root
        ref={ref}
        id={id}
        checked={isIndeterminate ? "indeterminate" : isSelected}
        defaultChecked={defaultSelected}
        onCheckedChange={(state) => onValueChange?.(state === true)}
        disabled={isOff}
        required={isRequired}
        className={slots.box()}
        {...rest}
      >
        <CheckboxPrimitive.Indicator className={slots.indicator()}>
          <svg viewBox="0 0 24 24" className={iconSize} fill="none" stroke="currentColor" strokeWidth="3.5" aria-hidden="true">
            <path
              d={isIndeterminate ? "M6 12h12" : "M5 12.5l4.5 4.5L19 7.5"}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {children ? (
        <label htmlFor={id} className={slots.label()}>
          {children}
        </label>
      ) : null}
    </div>
  );
});
