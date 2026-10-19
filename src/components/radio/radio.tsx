import * as React from "react";
import { RadioGroup as RadioPrimitive } from "radix-ui";
import { tv } from "../../utils/tv";
import { cn } from "../../utils/cn";
import { useCenngeDefaults } from "../../provider";
import { useId } from "../../utils/use-id";
import type { CenngeColor, CenngeSize } from "../../types";
import { useFormField } from "../form/form";

interface RadioStyle {
  color: CenngeColor;
  size: CenngeSize;
  isInvalid?: boolean;
}

const RadioStyleContext = React.createContext<RadioStyle>({ color: "primary", size: "md" });

const radio = tv({
  slots: {
    base: "group inline-flex items-start gap-2.5 data-[disabled]:opacity-(--cennge-disabled-opacity)",
    control: [
      "flex shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-default-400 bg-transparent",
      "transition-[border-color,transform] duration-(--cennge-duration-fast) ease-tactile active:scale-90 motion-reduce:transition-none",
      "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
      "disabled:cursor-not-allowed",
    ],
    dot: "block rounded-full data-[state=checked]:animate-cennge-pop-in motion-reduce:animate-none",
    label: "flex cursor-pointer flex-col text-sm text-foreground select-none group-data-[disabled]:cursor-not-allowed",
    description: "text-xs text-muted",
  },
  variants: {
    size: {
      sm: { control: "mt-0.5 size-4", dot: "size-1.5", label: "text-xs leading-5" },
      md: { control: "mt-px size-5", dot: "size-2", label: "leading-6" },
      lg: { control: "size-6", dot: "size-2.5", label: "text-base leading-6" },
    },
    color: {
      default: { control: "data-[state=checked]:border-default-500", dot: "bg-default-500" },
      primary: { control: "data-[state=checked]:border-primary", dot: "bg-primary" },
      secondary: { control: "data-[state=checked]:border-secondary", dot: "bg-secondary" },
      success: { control: "data-[state=checked]:border-success", dot: "bg-success" },
      warning: { control: "data-[state=checked]:border-warning", dot: "bg-warning" },
      danger: { control: "data-[state=checked]:border-danger", dot: "bg-danger" },
      info: { control: "data-[state=checked]:border-info", dot: "bg-info" },
    },
    // An unchecked group with an error: the circles turn red, like the borders of other fields.
    isInvalid: { true: { control: "data-[state=unchecked]:border-danger" } },
  },
});

export interface RadioGroupProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** @default "vertical" */
  orientation?: "horizontal" | "vertical";
  /** @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  name?: string;
  className?: string;
  children?: React.ReactNode;
}

export function RadioGroup({
  label,
  description,
  errorMessage: errorMessageProp,
  orientation = "vertical",
  color,
  size,
  isInvalid: isInvalidProp = false,
  isRequired = false,
  isDisabled = false,
  className,
  children,
  ...rest
}: RadioGroupProps) {
  const defaults = useCenngeDefaults();
  const id = useId();
  // Errors from a surrounding <Form>: server ones by name, and a required group left empty.
  const field = useFormField(rest.name, { isInvalid: isInvalidProp, errorMessage: errorMessageProp });
  const isInvalid = field.isInvalid;
  const errorMessage = field.errorMessage;
  const style = React.useMemo(
    () => ({
      color: color ?? (defaults.color && defaults.color !== "default" ? defaults.color : "primary"),
      size: size ?? defaults.size ?? "md",
      isInvalid,
    }),
    [color, size, defaults.color, defaults.size, isInvalid],
  );
  const helper = isInvalid && errorMessage ? errorMessage : description;
  const labelId = id ? `${id}-label` : undefined;
  const helperId = id ? `${id}-helper` : undefined;

  return (
    <RadioStyleContext.Provider value={style}>
      <div className={cn("flex flex-col gap-2", className)} data-field-name={rest.name} data-invalid={isInvalid || undefined}>
        {label ? (
          <span id={labelId} className={isInvalid ? "text-sm font-medium text-danger-text" : "text-sm font-medium text-foreground"}>
            {label}
            {isRequired ? <span className="ml-0.5 text-danger-text">*</span> : null}
          </span>
        ) : null}
        <RadioPrimitive.Root
          orientation={orientation}
          disabled={isDisabled}
          required={isRequired}
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={helper ? helperId : undefined}
          aria-invalid={isInvalid || undefined}
          className={orientation === "horizontal" ? "flex flex-wrap gap-x-6 gap-y-2" : "flex flex-col gap-2.5"}
          {...rest}
        >
          {children}
        </RadioPrimitive.Root>
        {helper ? (
          <div id={helperId} className={isInvalid && errorMessage ? "text-xs text-danger-text" : "text-xs text-muted"}>
            {helper}
          </div>
        ) : null}
      </div>
    </RadioStyleContext.Provider>
  );
}

export interface RadioProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value" | "color"> {
  value: string;
  description?: React.ReactNode;
  isDisabled?: boolean;
}

export const Radio = React.forwardRef<HTMLButtonElement, RadioProps>(function Radio(
  { value, description, isDisabled = false, disabled, className, children, id: idProp, ...rest },
  ref,
) {
  const style = React.useContext(RadioStyleContext);
  const id = useId(idProp);
  const slots = radio(style);
  const isOff = isDisabled || Boolean(disabled);

  return (
    <div className={slots.base({ class: className })} data-disabled={isOff || undefined}>
      <RadioPrimitive.Item ref={ref} id={id} value={value} disabled={isOff} className={slots.control()} {...rest}>
        <RadioPrimitive.Indicator className={slots.dot()} />
      </RadioPrimitive.Item>
      {children ? (
        <label htmlFor={id} className={slots.label()}>
          {children}
          {description ? <span className={slots.description()}>{description}</span> : null}
        </label>
      ) : null}
    </div>
  );
});
