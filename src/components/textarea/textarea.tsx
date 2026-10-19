import * as React from "react";
import { useCenngeDefaults } from "../../provider";
import { useId } from "../../utils/use-id";
import type { CenngeColor, CenngeRadius, CenngeSize } from "../../types";
import { input, type InputVariant } from "../input/input.styles";
import { useFormField } from "../form/form";

// useLayoutEffect warns during SSR on React 17/18; it only matters in the browser anyway.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

type TextareaSlots = "base" | "label" | "inputWrapper" | "input" | "description" | "errorMessage";

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "color" | "value" | "defaultValue"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Grows with the text between these line counts. @default 3 */
  minRows?: number;
  /** @default 8 */
  maxRows?: number;
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  /** @default "flat" */
  variant?: InputVariant;
  /** @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  /** @default "md" */
  radius?: CenngeRadius;
  classNames?: Partial<Record<TextareaSlots, string>>;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(props, ref) {
  const defaults = useCenngeDefaults();
  const {
    label,
    description,
    errorMessage: errorMessageProp,
    value: valueProp,
    defaultValue,
    onChange,
    onValueChange,
    minRows = 3,
    maxRows = 8,
    isInvalid: isInvalidProp = false,
    isRequired = false,
    isDisabled = false,
    disabled,
    required,
    variant = "flat",
    color,
    size,
    radius,
    className,
    classNames,
    id: idProp,
    ...rest
  } = props;

  const id = useId(idProp);
  // Errors from a surrounding <Form>: server ones by name, and the browser's own checks.
  const field = useFormField(rest.name, { isInvalid: isInvalidProp, errorMessage: errorMessageProp });
  const isInvalid = field.isInvalid;
  const errorMessage = field.errorMessage;
  const helperId = id ? `${id}-helper` : undefined;
  const isOff = isDisabled || Boolean(disabled);
  const isRequiredField = isRequired || Boolean(required);

  const isControlled = valueProp !== undefined;
  const [innerValue, setInnerValue] = React.useState(defaultValue ?? "");
  const value = isControlled ? valueProp : innerValue;

  const innerRef = React.useRef<HTMLTextAreaElement>(null);
  React.useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

  // Autosize: measure the content height and clamp it to minRows..maxRows.
  useIsomorphicLayoutEffect(() => {
    const node = innerRef.current;
    if (!node) return;
    const style = window.getComputedStyle(node);
    const lineHeight = parseFloat(style.lineHeight) || 20;
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    node.style.height = "auto";
    const min = lineHeight * minRows + padding;
    const max = lineHeight * maxRows + padding;
    const next = Math.min(Math.max(node.scrollHeight, min), max);
    node.style.height = `${next}px`;
    node.style.overflowY = node.scrollHeight > max ? "auto" : "hidden";
  }, [value, minRows, maxRows]);

  const slots = input({
    variant,
    color: color ?? (defaults.color && defaults.color !== "default" ? defaults.color : "primary"),
    size: size ?? defaults.size ?? "md",
    radius: radius ?? defaults.radius ?? "md",
    isInvalid,
  });
  const helper = isInvalid && errorMessage ? errorMessage : description;

  return (
    <div
      className={slots.base({ class: [classNames?.base, className] })}
      data-disabled={isOff || undefined}
      data-required={isRequiredField || undefined}
      data-field-name={rest.name}
      data-invalid={isInvalid || undefined}
    >
      {label ? (
        <label htmlFor={id} className={slots.label({ class: classNames?.label })}>
          {label}
        </label>
      ) : null}
      <div className={slots.inputWrapper({ class: ["h-auto items-start py-2", classNames?.inputWrapper] })}>
        <textarea
          ref={innerRef}
          id={id}
          rows={minRows}
          value={value}
          onChange={(event) => {
            if (!isControlled) setInnerValue(event.target.value);
            onChange?.(event);
            onValueChange?.(event.target.value);
          }}
          disabled={isOff}
          required={isRequiredField}
          aria-invalid={isInvalid || undefined}
          aria-describedby={helper ? helperId : undefined}
          className={slots.input({
            class: [
              "resize-none leading-relaxed [scrollbar-color:var(--cennge-border)_transparent] scrollbar-thin",
              classNames?.input,
            ],
          })}
          {...rest}
        />
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
