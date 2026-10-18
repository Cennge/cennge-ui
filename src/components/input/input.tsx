import * as React from "react";
import { useCenngeDefaults } from "../../provider";
import { useId } from "../../utils/use-id";
import type { CenngeColor, CenngeRadius, CenngeSize } from "../../types";
import { input, type InputVariant } from "./input.styles";

type InputSlots = "base" | "label" | "inputWrapper" | "input" | "clearButton" | "description" | "errorMessage";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "color" | "value" | "defaultValue"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Shown instead of `description` while `isInvalid`. */
  errorMessage?: React.ReactNode;
  /** @default "flat" */
  variant?: InputVariant;
  /** Focus colour. @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  /** @default "md" */
  radius?: CenngeRadius;
  value?: string;
  defaultValue?: string;
  /** Called with the new string value. Fires alongside `onChange`. */
  onValueChange?: (value: string) => void;
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  /** Shows a clear button while the field has a value. */
  isClearable?: boolean;
  onClear?: () => void;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  /** Classes for inner parts. `className` goes to the outer wrapper. */
  classNames?: Partial<Record<InputSlots, string>>;
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const defaults = useCenngeDefaults();
  const {
    label,
    description,
    errorMessage,
    variant = "flat",
    color = defaults.color === "default" || !defaults.color ? "primary" : defaults.color,
    size = defaults.size ?? "md",
    radius = defaults.radius ?? "md",
    value: valueProp,
    defaultValue,
    onChange,
    onValueChange,
    isInvalid = false,
    isRequired = false,
    isDisabled: isDisabledProp = false,
    disabled,
    required,
    isClearable = false,
    onClear,
    startContent,
    endContent,
    className,
    classNames,
    id: idProp,
    ...rest
  } = props;

  const id = useId(idProp);
  const helperId = id ? `${id}-helper` : undefined;
  const isDisabled = isDisabledProp || Boolean(disabled);
  const isRequiredField = isRequired || Boolean(required);

  // Works controlled (`value`) and uncontrolled (`defaultValue`); the clear button needs to know the value either way.
  const isControlled = valueProp !== undefined;
  const [innerValue, setInnerValue] = React.useState(defaultValue ?? "");
  const value = isControlled ? valueProp : innerValue;

  const innerRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInnerValue(event.target.value);
    onChange?.(event);
    onValueChange?.(event.target.value);
  };

  const handleClear = () => {
    if (!isControlled) setInnerValue("");
    onValueChange?.("");
    onClear?.();
    innerRef.current?.focus();
  };

  const slots = input({ variant, color, size, radius, isInvalid });
  const helper = isInvalid && errorMessage ? errorMessage : description;

  return (
    <div
      className={slots.base({ class: [classNames?.base, className] })}
      data-disabled={isDisabled || undefined}
      data-required={isRequiredField || undefined}
      data-invalid={isInvalid || undefined}
    >
      {label ? (
        <label htmlFor={id} className={slots.label({ class: classNames?.label })}>
          {label}
        </label>
      ) : null}
      <div
        className={slots.inputWrapper({ class: classNames?.inputWrapper })}
        onClick={() => innerRef.current?.focus()}
      >
        {startContent}
        <input
          ref={innerRef}
          id={id}
          value={value}
          onChange={handleChange}
          disabled={isDisabled}
          required={isRequiredField}
          aria-invalid={isInvalid || undefined}
          aria-describedby={helper ? helperId : undefined}
          className={slots.input({ class: classNames?.input })}
          {...rest}
        />
        {isClearable && value && !isDisabled ? (
          <button
            type="button"
            aria-label="Clear"
            onClick={handleClear}
            className={slots.clearButton({ class: classNames?.clearButton })}
          >
            <ClearIcon />
          </button>
        ) : null}
        {endContent}
      </div>
      {helper ? (
        <div
          id={helperId}
          className={
            isInvalid && errorMessage
              ? slots.errorMessage({ class: classNames?.errorMessage })
              : slots.description({ class: classNames?.description })
          }
        >
          {helper}
        </div>
      ) : null}
    </div>
  );
});
