import * as React from "react";
import { flushSync } from "react-dom";
import { useId } from "../../utils/use-id";
import { useCenngeDefaults } from "../../provider";
import type { CenngeColor, CenngeRadius, CenngeSize } from "../../types";
import { input, type InputVariant } from "../input/input.styles";
import {
  formatTime,
  fromMinutes,
  parseIsoTime,
  parseTimeText,
  timePattern,
  timeSegments,
  toIsoTime,
  toMinutes,
  usesDayPeriod,
  type TimeOfDay,
} from "./time";

// useLayoutEffect warns during SSR on React 17/18; it only matters in the browser anyway.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export type TimeInputError = { type: "invalid"; pattern: string } | { type: "outOfRange"; min?: string; max?: string };

type TimeInputSlots = "base" | "label" | "inputWrapper" | "input" | "description" | "errorMessage";

export interface TimeInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "color" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step" | "type"
  > {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Shown instead of `description` while `isInvalid`. */
  errorMessage?: React.ReactNode;
  /** "HH:mm" on a 24-hour clock, e.g. "14:30"; `null` when empty. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Earliest time, "HH:mm". */
  minValue?: string;
  /** Latest time, "HH:mm". */
  maxValue?: string;
  /** Minutes the arrow keys move in the minutes part; times snap to it. @default 1 */
  step?: number;
  /** 12 shows AM/PM. @default the locale's clock */
  hourCycle?: 12 | 24;
  /** @default the provider's locale, else "en-US" */
  locale?: string;
  /** Text under the field when typed text is refused. Override to translate. */
  formatError?: (error: TimeInputError) => string;
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  /** @default "flat" */
  variant?: InputVariant;
  /** @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  /** @default "md" */
  radius?: CenngeRadius;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  classNames?: Partial<Record<TimeInputSlots, string>>;
}

/**
 * A time field. Typed text is read leniently ("1430", "14.30", "2:30 pm") when the field loses focus
 * or on Enter; the arrow keys change the part under the caret: hours, minutes by `step`, or AM/PM.
 */
export const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(function TimeInput(props, ref) {
  const defaults = useCenngeDefaults();
  const {
    label,
    description,
    errorMessage,
    value: valueProp,
    defaultValue,
    onValueChange,
    minValue,
    maxValue,
    step = 1,
    hourCycle,
    locale = defaults.locale ?? "en-US",
    formatError,
    isInvalid = false,
    isRequired = false,
    isDisabled: isDisabledProp = false,
    disabled,
    isReadOnly: isReadOnlyProp = false,
    readOnly,
    required,
    variant = "flat",
    color = defaults.color && defaults.color !== "default" ? defaults.color : "primary",
    size = defaults.size ?? "md",
    radius = defaults.radius ?? "md",
    startContent,
    endContent,
    name,
    placeholder,
    className,
    classNames,
    id: idProp,
    onBlur,
    onKeyDown,
    ...rest
  } = props;

  const id = useId(idProp);
  const helperId = id ? `${id}-helper` : undefined;
  const isDisabled = isDisabledProp || Boolean(disabled);
  const isReadOnly = isReadOnlyProp || Boolean(readOnly);
  const isRequiredField = isRequired || Boolean(required);
  const hour12 = hourCycle ? hourCycle === 12 : usesDayPeriod(locale);
  const pattern = timePattern(locale, hour12);

  const isControlled = valueProp !== undefined;
  const [innerValue, setInnerValue] = React.useState(defaultValue ?? null);
  const value = parseIsoTime(isControlled ? valueProp : innerValue);
  const valueIso = value ? toIsoTime(value) : null;
  const min = parseIsoTime(minValue);
  const max = parseIsoTime(maxValue);

  const show = (time: TimeOfDay | null) => (time ? formatTime(time, locale, hour12) : "");
  const [text, setText] = React.useState(() => show(value));
  const [error, setError] = React.useState<TimeInputError | null>(null);
  const [announcement, setAnnouncement] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  React.useEffect(() => {
    setText(show(value));
    setError(null);
  }, [valueIso, locale, hour12]); // not on every keystroke

  // After an arrow key, the changed part stays selected, as in a native time field.
  const pendingSelection = React.useRef<[number, number] | null>(null);
  useIsomorphicLayoutEffect(() => {
    const selection = pendingSelection.current;
    if (!selection || document.activeElement !== inputRef.current) return;
    pendingSelection.current = null;
    inputRef.current?.setSelectionRange(selection[0], selection[1]);
  });

  const isOutOfRange = (time: TimeOfDay) =>
    Boolean((min && toMinutes(time) < toMinutes(min)) || (max && toMinutes(time) > toMinutes(max)));

  const commit = (next: TimeOfDay | null) => {
    setText(show(next));
    setError(null);
    const iso = next ? toIsoTime(next) : null;
    if (iso === valueIso) return;
    if (!isControlled) setInnerValue(iso);
    onValueChange?.(iso);
  };

  const commitText = () => {
    if (!text.trim()) {
      commit(null);
      return;
    }
    const parsed = parseTimeText(text, locale);
    if (!parsed) setError({ type: "invalid", pattern });
    else if (isOutOfRange(parsed)) setError({ type: "outOfRange", min: minValue, max: maxValue });
    else commit(parsed);
  };

  const nudge = (direction: 1 | -1, field: HTMLInputElement) => {
    const now = new Date();
    const current =
      parseTimeText(text, locale) ?? value ?? min ?? fromMinutes(now.getHours() * 60 + now.getMinutes() - ((now.getMinutes() % step) || 0));
    const caret = field.selectionStart ?? 0;
    const segments = timeSegments(current, locale, hour12);
    const segment =
      segments.find((part) => caret >= part.start && caret <= part.end) ??
      [...segments].reverse().find((part) => caret >= part.end) ??
      segments[0];
    const total = toMinutes(current);
    let next: TimeOfDay;
    if (segment?.type === "minute") {
      const snapped = direction > 0 ? Math.floor(total / step) * step + step : Math.ceil(total / step) * step - step;
      next = fromMinutes(snapped);
    } else if (segment?.type === "dayPeriod") {
      next = fromMinutes(total + 720);
    } else {
      next = fromMinutes(total + direction * 60);
    }
    if (min && toMinutes(next) < toMinutes(min)) next = min;
    if (max && toMinutes(next) > toMinutes(max)) next = max;
    commit(next);
    const range = timeSegments(next, locale, hour12).find((part) => part.type === (segment?.type ?? "hour"));
    if (range) pendingSelection.current = [range.start, range.end];
    setAnnouncement(show(next));
  };

  const showInvalid = isInvalid || error !== null;
  const slots = input({ variant, color, size, radius, isInvalid: showInvalid });
  const defaultError = (problem: TimeInputError) => {
    if (problem.type === "invalid") return `Enter a time as ${problem.pattern}`;
    if (min && max) return `Choose a time from ${show(min)} to ${show(max)}`;
    return min ? `Choose a time from ${show(min)}` : `Choose a time until ${show(max)}`;
  };
  const errorText = error ? (formatError ?? defaultError)(error) : isInvalid ? errorMessage : undefined;
  const helper = errorText ?? description;

  return (
    <div
      className={slots.base({ class: [classNames?.base, className] })}
      data-disabled={isDisabled || undefined}
      data-required={isRequiredField || undefined}
      data-invalid={showInvalid || undefined}
    >
      {label ? (
        <label htmlFor={id} className={slots.label({ class: classNames?.label })}>
          {label}
        </label>
      ) : null}
      <div className={slots.inputWrapper({ class: classNames?.inputWrapper })} onClick={() => inputRef.current?.focus()}>
        {startContent}
        <input
          ref={inputRef}
          id={id}
          type="text"
          // Phones show the number pad on 24-hour clocks; AM/PM needs letters.
          inputMode={hour12 ? "text" : "numeric"}
          autoComplete="off"
          value={text}
          placeholder={placeholder ?? pattern}
          disabled={isDisabled}
          readOnly={isReadOnly}
          required={isRequiredField}
          aria-invalid={showInvalid || undefined}
          aria-describedby={helper ? helperId : undefined}
          onChange={(event) => {
            setText(event.target.value);
            setError(null);
          }}
          onBlur={(event) => {
            onBlur?.(event);
            if (!isReadOnly) commitText();
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || isReadOnly) return;
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              event.preventDefault();
              nudge(event.key === "ArrowUp" ? 1 : -1, event.currentTarget);
            } else if (event.key === "Enter") {
              flushSync(commitText); // before a surrounding form reads the hidden value
            } else if (event.key === "Escape" && text !== show(value)) {
              event.preventDefault();
              event.stopPropagation();
              setText(show(value));
              setError(null);
            }
          }}
          className={slots.input({ class: ["tabular-nums", classNames?.input] })}
          {...rest}
        />
        {endContent}
      </div>
      {/* Arrow keys change the text without typing; screen readers hear the new time. */}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
      {name ? <input type="hidden" name={name} value={valueIso ?? ""} /> : null}
      {helper ? (
        <div
          id={helperId}
          className={
            errorText
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
