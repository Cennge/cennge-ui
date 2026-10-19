import * as React from "react";
import { flushSync } from "react-dom";
import { Popover as PopoverPrimitive } from "radix-ui";
import { cn } from "../../utils/cn";
import { useId } from "../../utils/use-id";
import { useCenngeDefaults } from "../../provider";
import type { CenngeColor, CenngeRadius, CenngeSize } from "../../types";
import { input, type InputVariant } from "../input/input.styles";
import { popoverContentClass } from "../popover/popover";
import { defaultCalendarLabels, type CalendarLabels } from "../calendar/calendar-view";
import { RangeCalendar, firstUnavailableDay, parseRange, type DateRange } from "../calendar/range-calendar";
import {
  compareDates,
  formatDateField,
  getDateFieldFormat,
  isOutOfRange,
  parseDateField,
  parseIsoDate,
  toIsoDate,
  type CalendarDate,
} from "../calendar/date";
import { CalendarIcon, calendarButtonClass, defaultDateError, type DatePickerError } from "../date-picker/shared";
import { useFormField } from "../form/form";

export type DateRangePickerError = DatePickerError | { type: "order" };

export interface DateRangePickerLabels extends CalendarLabels {
  /** Name of the calendar button and of the calendar popup. @default "Choose dates" */
  chooseDates: string;
  /** @default "Start date" */
  start: string;
  /** @default "End date" */
  end: string;
}

type DateRangePickerSlots =
  | "base"
  | "label"
  | "inputWrapper"
  | "input"
  | "separator"
  | "calendarButton"
  | "popover"
  | "description"
  | "errorMessage";

export interface DateRangePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "color" | "placeholder"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Shown instead of `description` while `isInvalid`. */
  errorMessage?: React.ReactNode;
  /** ISO dates; `null` when empty. */
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onValueChange?: (range: DateRange | null) => void;
  minValue?: string;
  maxValue?: string;
  /** Return true for dates that cannot be chosen. A range cannot run across them. */
  isDateUnavailable?: (date: string) => boolean;
  /** @default the provider's locale, else "en-US" */
  locale?: string;
  firstDayOfWeek?: number;
  /** Months side by side in the calendar; they wrap on narrow screens. @default 2 */
  visibleMonths?: number;
  /** Text under the field when typed dates are refused. Override to translate. */
  formatError?: (error: DateRangePickerError) => string;
  labels?: Partial<DateRangePickerLabels>;
  /** Placeholder of both fields. @default the locale's pattern, e.g. "DD.MM.YYYY" */
  placeholder?: string;
  /** Form field names for the two ISO dates. */
  startName?: string;
  endName?: string;
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
  classNames?: Partial<Record<DateRangePickerSlots, string>>;
}

/**
 * Two date fields, start and end, with a range calendar. Each field reads typed dates leniently;
 * the range is saved once both are valid, in order, and free of unavailable days.
 */
export const DateRangePicker = React.forwardRef<HTMLDivElement, DateRangePickerProps>(function DateRangePicker(props, ref) {
  const defaults = useCenngeDefaults();
  const {
    label,
    description,
    errorMessage: errorMessageProp,
    value: valueProp,
    defaultValue,
    onValueChange,
    minValue,
    maxValue,
    isDateUnavailable,
    locale = defaults.locale ?? "en-US",
    firstDayOfWeek,
    visibleMonths = 2,
    formatError,
    labels: labelsProp,
    placeholder,
    startName,
    endName,
    isInvalid: isInvalidProp = false,
    isRequired = false,
    isDisabled = false,
    isReadOnly = false,
    variant = "flat",
    color = defaults.color && defaults.color !== "default" ? defaults.color : "primary",
    size = defaults.size ?? "md",
    radius = defaults.radius ?? "md",
    className,
    classNames,
    id: idProp,
    ...rest
  } = props;

  const id = useId(idProp);
  // Errors from a surrounding <Form>, by either name.
  const startField = useFormField(startName, { isInvalid: isInvalidProp, errorMessage: errorMessageProp });
  const endField = useFormField(endName);
  const isInvalid = startField.isInvalid || endField.isInvalid;
  const errorMessage = startField.isInvalid ? startField.errorMessage : endField.errorMessage;
  const labelId = id ? `${id}-label` : undefined;
  const helperId = id ? `${id}-helper` : undefined;
  const labels = { ...defaultCalendarLabels, chooseDates: "Choose dates", start: "Start date", end: "End date", ...labelsProp };
  const { pattern } = getDateFieldFormat(locale);

  const isControlled = valueProp !== undefined;
  const [innerValue, setInnerValue] = React.useState(defaultValue ?? null);
  const value = parseRange(isControlled ? valueProp : innerValue);
  const valueKey = value ? `${toIsoDate(value.start)}/${toIsoDate(value.end)}` : "";
  const min = parseIsoDate(minValue);
  const max = parseIsoDate(maxValue);

  const show = (date: CalendarDate | undefined) => (date ? formatDateField(date, locale) : "");
  const [startText, setStartText] = React.useState(() => show(value?.start));
  const [endText, setEndText] = React.useState(() => show(value?.end));
  const [error, setError] = React.useState<DateRangePickerError | null>(null);
  const [isOpen, setOpen] = React.useState(false);
  const startRef = React.useRef<HTMLInputElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setStartText(show(value?.start));
    setEndText(show(value?.end));
    setError(null);
  }, [valueKey, locale]); // not on every keystroke

  const commit = (next: { start: CalendarDate; end: CalendarDate } | null) => {
    setError(null);
    if (next) {
      setStartText(show(next.start));
      setEndText(show(next.end));
    }
    const nextKey = next ? `${toIsoDate(next.start)}/${toIsoDate(next.end)}` : "";
    if (nextKey === valueKey) return;
    const range = next ? { start: toIsoDate(next.start), end: toIsoDate(next.end) } : null;
    if (!isControlled) setInnerValue(range);
    onValueChange?.(range);
    startField.markEdited();
    endField.markEdited();
  };

  const isUnavailable = (date: CalendarDate) => Boolean(isDateUnavailable?.(toIsoDate(date)));

  const commitTexts = () => {
    const startTyped = startText.trim();
    const endTyped = endText.trim();
    if (!startTyped && !endTyped) {
      commit(null);
      return;
    }
    const start = startTyped ? parseDateField(startTyped, locale) : null;
    const end = endTyped ? parseDateField(endTyped, locale) : null;
    if ((startTyped && !start) || (endTyped && !end)) {
      setError({ type: "invalid", pattern });
      return;
    }
    if (!start || !end) {
      setError(null); // the other end is still to come
      return;
    }
    if (isOutOfRange(start, min, max) || isOutOfRange(end, min, max)) {
      setError({ type: "outOfRange", min: minValue, max: maxValue });
      return;
    }
    if (compareDates(end, start) < 0) {
      setError({ type: "order" });
      return;
    }
    const blocked = firstUnavailableDay({ start, end }, isUnavailable);
    if (blocked) {
      setError({ type: "unavailable", date: toIsoDate(blocked) });
      return;
    }
    commit({ start, end });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    if (event.key === "Enter") {
      flushSync(commitTexts); // before a surrounding form reads the hidden values
    } else if (event.key === "ArrowDown" && event.altKey) {
      event.preventDefault();
      setOpen(true);
    }
  };

  const showInvalid = isInvalid || error !== null;
  const slots = input({ variant, color, size, radius, isInvalid: showInvalid });
  const errorText = error ? (formatError ? formatError(error) : defaultDateError(error, locale)) : isInvalid ? errorMessage : undefined;
  const helper = errorText ?? description;

  const field = (part: "start" | "end") => (
    <input
      ref={part === "start" ? startRef : undefined}
      id={part === "start" ? id : undefined}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      aria-label={part === "start" ? labels.start : labels.end}
      aria-invalid={showInvalid || undefined}
      aria-describedby={helper ? helperId : undefined}
      value={part === "start" ? startText : endText}
      placeholder={placeholder ?? pattern}
      disabled={isDisabled}
      readOnly={isReadOnly}
      required={isRequired}
      onChange={(event) => {
        (part === "start" ? setStartText : setEndText)(event.target.value);
        setError(null);
      }}
      onBlur={() => {
        if (!isReadOnly) commitTexts();
      }}
      onKeyDown={handleKeyDown}
      // As wide as a date in the locale's pattern, so the two dates sit side by side.
      style={{ width: `${pattern.length + 1}ch` }}
      className={slots.input({ class: ["flex-none tabular-nums", classNames?.input] })}
    />
  );

  return (
    <div
      ref={ref}
      className={slots.base({ class: [classNames?.base, className] })}
      data-disabled={isDisabled || undefined}
      data-required={isRequired || undefined}
      data-field-name={startName ?? endName}
      data-invalid={showInvalid || undefined}
      {...rest}
    >
      {label ? (
        // Names the pair; a click starts at the first field.
        <span id={labelId} className={slots.label({ class: ["w-fit", classNames?.label] })} onClick={() => startRef.current?.focus()}>
          {label}
        </span>
      ) : null}
      <PopoverPrimitive.Root open={isOpen} onOpenChange={setOpen}>
        <PopoverPrimitive.Anchor asChild>
          <div
            role="group"
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={helper ? helperId : undefined}
            className={slots.inputWrapper({ class: classNames?.inputWrapper })}
            onClick={(event) => {
              if (!(event.target as HTMLElement).closest("button, input")) startRef.current?.focus();
            }}
          >
            {field("start")}
            <span aria-hidden="true" className={cn("shrink-0 text-muted", classNames?.separator)}>
              –
            </span>
            {field("end")}
            <PopoverPrimitive.Trigger
              type="button"
              aria-label={labels.chooseDates}
              disabled={isDisabled || isReadOnly}
              className={cn(calendarButtonClass, "ml-auto", classNames?.calendarButton)}
            >
              <CalendarIcon />
            </PopoverPrimitive.Trigger>
          </div>
        </PopoverPrimitive.Anchor>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            ref={contentRef}
            aria-label={labels.chooseDates}
            side="bottom"
            align="start"
            sideOffset={6}
            collisionPadding={8}
            onOpenAutoFocus={(event) => event.preventDefault()}
            onEscapeKeyDown={(event) => {
              // The first Escape drops a half-chosen range or closes a month or year grid; the next one
              // closes the calendar.
              if (contentRef.current?.querySelector("[data-selecting], [data-picking]")) event.preventDefault();
            }}
            className={cn(
              popoverContentClass,
              "max-h-(--radix-popover-content-available-height) overflow-y-auto p-3",
              classNames?.popover,
            )}
          >
            <RangeCalendar
              value={value ? { start: toIsoDate(value.start), end: toIsoDate(value.end) } : null}
              onValueChange={(range) => {
                commit(parseRange(range));
                setOpen(false);
              }}
              minValue={minValue}
              maxValue={maxValue}
              isDateUnavailable={isDateUnavailable}
              locale={locale}
              firstDayOfWeek={firstDayOfWeek}
              visibleMonths={visibleMonths}
              labels={labels}
              color={color}
              size={size}
              autoFocus
            />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
      {startName ? <input type="hidden" name={startName} value={value ? toIsoDate(value.start) : ""} /> : null}
      {endName ? <input type="hidden" name={endName} value={value ? toIsoDate(value.end) : ""} /> : null}
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
