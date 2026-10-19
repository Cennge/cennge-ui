import * as React from "react";
import { flushSync } from "react-dom";
import { Popover as PopoverPrimitive } from "radix-ui";
import { cn } from "../../utils/cn";
import { useId } from "../../utils/use-id";
import { useCenngeDefaults } from "../../provider";
import type { CenngeColor, CenngeRadius, CenngeSize } from "../../types";
import { input, type InputVariant } from "../input/input.styles";
import { popoverContentClass } from "../popover/popover";
import { CalendarIcon, calendarButtonClass, defaultDateError, type DatePickerError } from "./shared";
import { Calendar } from "../calendar/calendar";
import { defaultCalendarLabels, type CalendarLabels } from "../calendar/calendar-view";
import {
  formatDateField,
  getDateFieldFormat,
  isOutOfRange,
  parseDateField,
  parseIsoDate,
  toIsoDate,
  type CalendarDate,
} from "../calendar/date";

export interface DatePickerLabels extends CalendarLabels {
  /** Name of the calendar button and of the calendar popup. @default "Choose date" */
  chooseDate: string;
}

type DatePickerSlots =
  | "base"
  | "label"
  | "inputWrapper"
  | "input"
  | "calendarButton"
  | "popover"
  | "description"
  | "errorMessage";

export interface DatePickerProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "color" | "value" | "defaultValue" | "onChange" | "min" | "max" | "type"
  > {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Shown instead of `description` while `isInvalid`. */
  errorMessage?: React.ReactNode;
  /** ISO date, e.g. "2026-10-19"; `null` when empty. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Earliest date that can be chosen or typed, ISO. */
  minValue?: string;
  /** Latest date that can be chosen or typed, ISO. */
  maxValue?: string;
  /** Return true for dates that cannot be chosen, e.g. fully booked days. */
  isDateUnavailable?: (date: string) => boolean;
  /** BCP 47 tag: the typed format, month and weekday names. @default the provider's locale, else "en-US" */
  locale?: string;
  /** 0 = Sunday … 6 = Saturday. @default the locale's */
  firstDayOfWeek?: number;
  /**
   * Text under the field when a typed date is refused. Override to translate.
   * @default "Enter a date as DD.MM.YYYY", "Choose a date from … to …", "This date is not available"
   */
  formatError?: (error: DatePickerError) => string;
  /** Accessible names of the calendar button and the calendar's controls. */
  labels?: Partial<DatePickerLabels>;
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  /** @default "flat" */
  variant?: InputVariant;
  /** Focus colour and the selected day's colour. @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  /** @default "md" */
  radius?: CenngeRadius;
  startContent?: React.ReactNode;
  classNames?: Partial<Record<DatePickerSlots, string>>;
}

/**
 * A date field: type a date in the locale's format or pick one from the calendar.
 * Typed text is read leniently ("19.10.2026", "19/10/26", "19102026") when the field loses focus or
 * on Enter; text that is not a valid date stays, with the reason under the field.
 */
export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(props, ref) {
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
    isDateUnavailable,
    locale = defaults.locale ?? "en-US",
    firstDayOfWeek,
    formatError,
    labels: labelsProp,
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
  const labels = { ...defaultCalendarLabels, chooseDate: "Choose date", ...labelsProp };
  const { pattern } = getDateFieldFormat(locale);

  const isControlled = valueProp !== undefined;
  const [innerValue, setInnerValue] = React.useState(defaultValue ?? null);
  const value = parseIsoDate(isControlled ? valueProp : innerValue);
  const valueIso = value ? toIsoDate(value) : null;
  const min = parseIsoDate(minValue);
  const max = parseIsoDate(maxValue);

  const [text, setText] = React.useState(() => (value ? formatDateField(value, locale) : ""));
  const [error, setError] = React.useState<DatePickerError | null>(null);
  const [isOpen, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  // The field shows the value in the locale's format whenever the value changes.
  React.useEffect(() => {
    setText(value ? formatDateField(value, locale) : "");
    setError(null);
  }, [valueIso, locale]); // not on every keystroke

  const commit = (next: CalendarDate | null) => {
    const iso = next ? toIsoDate(next) : null;
    if (next) setText(formatDateField(next, locale));
    setError(null);
    if (iso === valueIso) return;
    if (!isControlled) setInnerValue(iso);
    onValueChange?.(iso);
  };

  const isUnavailable = (date: CalendarDate) => Boolean(isDateUnavailable?.(toIsoDate(date)));

  const commitText = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      commit(null);
      return;
    }
    const parsed = parseDateField(trimmed, locale);
    if (!parsed) setError({ type: "invalid", pattern });
    else if (isOutOfRange(parsed, min, max)) setError({ type: "outOfRange", min: minValue, max: maxValue });
    else if (isUnavailable(parsed)) setError({ type: "unavailable", date: toIsoDate(parsed) });
    else commit(parsed);
  };

  const showInvalid = isInvalid || error !== null;
  const slots = input({ variant, color, size, radius, isInvalid: showInvalid });
  const errorText = error ? (formatError ? formatError(error) : defaultDateError(error, locale)) : isInvalid ? errorMessage : undefined;
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
      <PopoverPrimitive.Root open={isOpen} onOpenChange={setOpen}>
        <PopoverPrimitive.Anchor asChild>
          <div
            className={slots.inputWrapper({ class: classNames?.inputWrapper })}
            onClick={(event) => {
              // Clicks on empty space focus the input; the calendar button keeps its own behaviour.
              if (!(event.target as HTMLElement).closest("button")) inputRef.current?.focus();
            }}
          >
            {startContent}
            <input
              ref={inputRef}
              id={id}
              type="text"
              inputMode="numeric"
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
                if (event.key === "Enter") {
                  // Before a surrounding form reads the hidden value.
                  flushSync(commitText);
                } else if (event.key === "ArrowDown" && event.altKey) {
                  event.preventDefault();
                  setOpen(true);
                } else if (event.key === "Escape" && text !== (value ? formatDateField(value, locale) : "")) {
                  // Escape first undoes unsaved typing.
                  event.preventDefault();
                  event.stopPropagation();
                  setText(value ? formatDateField(value, locale) : "");
                  setError(null);
                }
              }}
              className={slots.input({ class: classNames?.input })}
              {...rest}
            />
            <PopoverPrimitive.Trigger
              type="button"
              aria-label={labels.chooseDate}
              disabled={isDisabled || isReadOnly}
              className={cn(calendarButtonClass, classNames?.calendarButton)}
            >
              <CalendarIcon />
            </PopoverPrimitive.Trigger>
          </div>
        </PopoverPrimitive.Anchor>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            aria-label={labels.chooseDate}
            side="bottom"
            align="start"
            sideOffset={6}
            collisionPadding={8}
            // The calendar puts focus on the selected day itself.
            onOpenAutoFocus={(event) => event.preventDefault()}
            className={cn(popoverContentClass, "p-3", classNames?.popover)}
          >
            <Calendar
              value={valueIso}
              onValueChange={(iso) => {
                commit(parseIsoDate(iso));
                setOpen(false);
              }}
              minValue={minValue}
              maxValue={maxValue}
              isDateUnavailable={isDateUnavailable}
              locale={locale}
              firstDayOfWeek={firstDayOfWeek}
              labels={labels}
              color={color}
              size={size}
              autoFocus
            />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
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
