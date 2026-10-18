import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { tv } from "../../utils/tv";
import { useCenngeDefaults } from "../../provider";
import { useId } from "../../utils/use-id";
import type { CenngeColor, CenngeSize } from "../../types";

const switchStyles = tv({
  slots: {
    base: "group inline-flex items-center gap-3 data-[disabled]:opacity-(--cennge-disabled-opacity)",
    track: [
      "relative inline-flex shrink-0 cursor-pointer items-center rounded-full bg-surface-4 p-0.5",
      "inset-shadow-[inset_0_1px_2px_rgb(0_0_0/0.25)] transition-colors duration-(--cennge-duration) ease-tactile",
      "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      "disabled:cursor-not-allowed motion-reduce:transition-none",
    ],
    thumb: [
      "pointer-events-none block rounded-full bg-white shadow-raised",
      "transition-[translate,width] duration-(--cennge-duration) ease-tactile motion-reduce:transition-none",
    ],
    label: "cursor-pointer text-sm text-foreground select-none group-data-[disabled]:cursor-not-allowed",
  },
  variants: {
    size: {
      sm: { track: "h-5 w-9", thumb: "size-4 data-[state=checked]:translate-x-4" },
      md: { track: "h-6 w-11", thumb: "size-5 data-[state=checked]:translate-x-5" },
      lg: { track: "h-7 w-[3.25rem]", thumb: "size-6 data-[state=checked]:translate-x-6" },
    },
    color: {
      default: { track: "data-[state=checked]:bg-default-500" },
      primary: { track: "data-[state=checked]:bg-primary" },
      secondary: { track: "data-[state=checked]:bg-secondary" },
      success: { track: "data-[state=checked]:bg-success" },
      warning: { track: "data-[state=checked]:bg-warning" },
      danger: { track: "data-[state=checked]:bg-danger" },
      info: { track: "data-[state=checked]:bg-info" },
    },
  },
  defaultVariants: { size: "md", color: "primary" },
});

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "onChange" | "value" | "defaultValue"> {
  /** Label next to the switch. Without it, pass `aria-label`. */
  children?: React.ReactNode;
  isSelected?: boolean;
  defaultSelected?: boolean;
  onValueChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
  /** @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  /** Form field name; the value is submitted as "on". */
  name?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    children,
    isSelected,
    defaultSelected,
    onValueChange,
    isDisabled = false,
    disabled,
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
  const slots = switchStyles({
    size: size ?? defaults.size ?? "md",
    color: color ?? (defaults.color && defaults.color !== "default" ? defaults.color : "primary"),
  });
  const isOff = isDisabled || Boolean(disabled);

  return (
    <div className={slots.base({ class: className })} data-disabled={isOff || undefined}>
      <SwitchPrimitive.Root
        ref={ref}
        id={id}
        checked={isSelected}
        defaultChecked={defaultSelected}
        onCheckedChange={onValueChange}
        disabled={isOff}
        className={slots.track()}
        {...rest}
      >
        <SwitchPrimitive.Thumb className={slots.thumb()} />
      </SwitchPrimitive.Root>
      {children ? (
        <label htmlFor={id} className={slots.label()}>
          {children}
        </label>
      ) : null}
    </div>
  );
});
