import * as React from "react";
import { flushSync } from "react-dom";
import { tv } from "../../utils/tv";
import { useId } from "../../utils/use-id";
import { useCenngeDefaults } from "../../provider";
import type { CenngeColor, CenngeRadius, CenngeSize } from "../../types";
import { input, type InputVariant } from "../input/input.styles";
import { addStep, clamp, decimals, getNumberSymbols, isPartialNumber, parseNumber, roundTo } from "./number-parser";

type NumberInputSlots =
  | "base"
  | "label"
  | "inputWrapper"
  | "input"
  | "stepper"
  | "stepperButton"
  | "description"
  | "errorMessage";

const stepper = tv({
  slots: {
    group: "-mr-1.5 flex shrink-0 items-center gap-0.5",
    button: [
      "flex shrink-0 cursor-pointer items-center justify-center rounded-small text-muted select-none",
      "transition-[background-color,color,transform] duration-(--cennge-duration-fast) ease-tactile motion-reduce:transition-none",
      "hover:bg-default-bg hover:text-foreground active:scale-90",
      "disabled:pointer-events-none disabled:opacity-35",
    ],
  },
  variants: {
    size: {
      // 24px+ targets: WCAG 2.2 target size, and usable with a thumb.
      sm: { button: "size-6" },
      md: { button: "size-7" },
      lg: { button: "size-8" },
    },
  },
});

export interface NumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "color" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step" | "type" | "inputMode"
  > {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  /** `null` means empty. */
  value?: number | null;
  defaultValue?: number | null;
  /** Fires while typing (for every parseable value) and on step, clamp or clear. */
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Arrow keys and buttons. @default 1, or 0.01 for percent */
  step?: number;
  /** PageUp / PageDown. @default step × 10 */
  largeStep?: number;
  /** Intl.NumberFormat options: currency, percent, units, fraction digits, grouping. */
  formatOptions?: Intl.NumberFormatOptions;
  /** Overrides the CenngeProvider locale. @default "en-US" */
  locale?: string;
  /** Hide the − / + buttons. Keyboard stepping still works. */
  hideStepper?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  /** @default "flat" */
  variant?: InputVariant;
  /** Focus colour. @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  /** @default "md" */
  radius?: CenngeRadius;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  /** @default "Increase" */
  incrementLabel?: string;
  /** @default "Decrease" */
  decrementLabel?: string;
  classNames?: Partial<Record<NumberInputSlots, string>>;
}

function StepIcon({ kind }: { kind: "plus" | "minus" }) {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d={kind === "plus" ? "M12 5v14M5 12h14" : "M5 12h14"} strokeLinecap="round" />
    </svg>
  );
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(props, ref) {
  const defaults = useCenngeDefaults();
  const {
    label,
    description,
    errorMessage,
    value: valueProp,
    defaultValue = null,
    onValueChange,
    min,
    max,
    step: stepProp,
    largeStep: largeStepProp,
    formatOptions,
    locale = defaults.locale ?? "en-US",
    hideStepper = false,
    isInvalid = false,
    isRequired = false,
    isDisabled: isDisabledProp = false,
    disabled,
    isReadOnly: isReadOnlyProp = false,
    readOnly,
    required,
    variant = "flat",
    color,
    size,
    radius,
    startContent,
    endContent,
    incrementLabel = "Increase",
    decrementLabel = "Decrease",
    name,
    id: idProp,
    className,
    classNames,
    onBlur,
    onFocus,
    onKeyDown,
    ...rest
  } = props;

  const id = useId(idProp);
  const helperId = id ? `${id}-helper` : undefined;
  const isDisabled = isDisabledProp || Boolean(disabled);
  const isReadOnly = isReadOnlyProp || Boolean(readOnly);
  const isRequiredField = isRequired || Boolean(required);
  const sizeValue = size ?? defaults.size ?? "md";

  /* --------------------------------------------------- formatting rules */
  const isPercent = formatOptions?.style === "percent";
  const step = stepProp ?? (isPercent ? 0.01 : 1);
  const largeStep = largeStepProp ?? roundTo(step * 10, decimals(step));
  // optionsKey stands in for formatOptions so an inline object does not rebuild the formatter every render.
  const optionsKey = JSON.stringify(formatOptions ?? {});
  const formatter = React.useMemo(() => new Intl.NumberFormat(locale, formatOptions), [locale, optionsKey]);
  const symbols = React.useMemo(() => getNumberSymbols(locale, formatOptions), [locale, optionsKey]);
  const shownDigits = (formatter.resolvedOptions().maximumFractionDigits ?? 3) + (isPercent ? 2 : 0);
  const fractionDigits = Math.max(shownDigits, decimals(step));
  const allowDecimal = fractionDigits > 0;
  const allowNegative = min === undefined || min < 0;
  const format = (v: number | null) => (v === null ? "" : formatter.format(v));

  /* ------------------------------------------------------------- state */
  const isControlled = valueProp !== undefined;
  const [innerValue, setInnerValue] = React.useState<number | null>(defaultValue);
  const value = isControlled ? valueProp : innerValue;
  const [text, setText] = React.useState(() => format(value));
  const isFocused = React.useRef(false);

  // The press-and-hold timer reads these, so it always sees the newest value.
  const latest = React.useRef({ value, text });
  latest.current = { value, text };

  // Show external changes, but never rewrite what the user is typing.
  React.useEffect(() => {
    if (!isFocused.current) setText(format(value));
  }, [value, formatter]);

  const report = (next: number | null) => {
    if (next === latest.current.value) return;
    latest.current.value = next;
    if (!isControlled) setInnerValue(next);
    onValueChange?.(next);
  };

  const commitText = () => {
    const parsed = parseNumber(latest.current.text, symbols, isPercent);
    // Unparseable leftovers ("-", ".") fall back to the last valid value.
    let next = parsed === null ? null : Number.isNaN(parsed) ? latest.current.value : parsed;
    if (next !== null) next = roundTo(clamp(next, min, max), fractionDigits);
    report(next);
    setText(format(next));
  };

  /* ---------------------------------------------------------- stepping */
  const repeat = React.useRef<{ timeout?: ReturnType<typeof setTimeout>; interval?: ReturnType<typeof setInterval> }>({});
  const stopRepeat = React.useCallback(() => {
    clearTimeout(repeat.current.timeout);
    clearInterval(repeat.current.interval);
    repeat.current = {};
  }, []);
  React.useEffect(() => stopRepeat, [stopRepeat]);

  const stepBy = (amount: number) => {
    if (isDisabled || isReadOnly) return;
    // Mid-typing, step from what is typed rather than from the last committed value.
    const typed = parseNumber(latest.current.text, symbols, isPercent);
    const current = typed === null || Number.isNaN(typed) ? latest.current.value : typed;
    const next =
      current === null
        ? clamp(amount > 0 ? (min ?? 0) : (max ?? 0), min, max)
        : clamp(addStep(current, amount), min, max);
    report(next);
    const nextText = format(next);
    latest.current.text = nextText;
    setText(nextText);
    if (next === min || next === max) stopRepeat();
  };

  const setToBound = (bound: number) => {
    if (isDisabled || isReadOnly) return;
    report(bound);
    setText(format(bound));
  };

  const canIncrement = !isDisabled && !isReadOnly && !(max !== undefined && value !== null && value >= max);
  const canDecrement = !isDisabled && !isReadOnly && !(min !== undefined && value !== null && value <= min);

  const pressHandlers = (amount: number) => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;
      event.preventDefault(); // keep focus where it is
      stopRepeat();
      stepBy(amount);
      repeat.current.timeout = setTimeout(() => {
        repeat.current.interval = setInterval(() => stepBy(amount), 60);
      }, 400);
      window.addEventListener("pointerup", stopRepeat, { once: true });
      window.addEventListener("pointercancel", stopRepeat, { once: true });
    },
    onPointerLeave: stopRepeat,
    // Screen readers and keyboard "click" without a pointer: detail is 0.
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      if (event.detail === 0) stepBy(amount);
    },
  });

  /* ------------------------------------------------------------ events */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        stepBy(step);
        break;
      case "ArrowDown":
        event.preventDefault();
        stepBy(-step);
        break;
      case "PageUp":
        event.preventDefault();
        stepBy(largeStep);
        break;
      case "PageDown":
        event.preventDefault();
        stepBy(-largeStep);
        break;
      case "Home":
        if (min !== undefined) {
          event.preventDefault();
          setToBound(min);
        }
        break;
      case "End":
        if (max !== undefined) {
          event.preventDefault();
          setToBound(max);
        }
        break;
      case "Enter":
        // The form submits right after this keydown. Firefox does that before React's normal
        // update would reach the hidden input, so commit synchronously.
        flushSync(commitText);
        break;
    }
  };

  const slots = input({
    variant,
    color: color ?? (defaults.color && defaults.color !== "default" ? defaults.color : "primary"),
    size: sizeValue,
    radius: radius ?? defaults.radius ?? "md",
    isInvalid,
  });
  const stepSlots = stepper({ size: sizeValue });
  const helper = isInvalid && errorMessage ? errorMessage : description;
  const innerRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

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
        onClick={(event) => {
          if (!(event.target as HTMLElement).closest("button")) innerRef.current?.focus();
        }}
      >
        {startContent}
        <input
          ref={innerRef}
          id={id}
          type="text"
          role="spinbutton"
          // iOS numeric keypads have no minus key: fall back to the text keyboard when negatives are allowed.
          inputMode={allowNegative ? "text" : allowDecimal ? "decimal" : "numeric"}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-valuenow={value ?? undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={value === null ? undefined : formatter.format(value)}
          aria-invalid={isInvalid || undefined}
          aria-describedby={helper ? helperId : undefined}
          required={isRequiredField}
          disabled={isDisabled}
          readOnly={isReadOnly}
          value={text}
          onChange={(event) => {
            const nextText = event.target.value;
            // Refuse keystrokes that can never become a number: the controlled input keeps the old text.
            if (!isPartialNumber(nextText, symbols, { allowNegative, allowDecimal })) return;
            latest.current.text = nextText;
            setText(nextText);
            const parsed = parseNumber(nextText, symbols, isPercent);
            if (parsed === null || !Number.isNaN(parsed)) report(parsed);
          }}
          onKeyDown={handleKeyDown}
          onFocus={(event) => {
            isFocused.current = true;
            onFocus?.(event);
          }}
          onBlur={(event) => {
            isFocused.current = false;
            commitText();
            onBlur?.(event);
          }}
          className={slots.input({ class: ["tabular-nums", classNames?.input] })}
          {...rest}
        />
        {endContent}
        {hideStepper ? null : (
          <div className={stepSlots.group({ class: classNames?.stepper })}>
            <button
              type="button"
              tabIndex={-1}
              aria-label={decrementLabel}
              aria-controls={id}
              disabled={!canDecrement}
              className={stepSlots.button({ class: classNames?.stepperButton })}
              {...pressHandlers(-step)}
            >
              <StepIcon kind="minus" />
            </button>
            <button
              type="button"
              tabIndex={-1}
              aria-label={incrementLabel}
              aria-controls={id}
              disabled={!canIncrement}
              className={stepSlots.button({ class: classNames?.stepperButton })}
              {...pressHandlers(step)}
            >
              <StepIcon kind="plus" />
            </button>
          </div>
        )}
      </div>
      {/* Forms get the raw number, not the formatted text. */}
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
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
