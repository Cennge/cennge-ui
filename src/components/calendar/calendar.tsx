import * as React from "react";
import { useCenngeDefaults } from "../../provider";
import type { CenngeColor, CenngeSize } from "../../types";
import {
  CalendarView,
  defaultCalendarLabels,
  useCalendarFocus,
  viewFor,
  type CalendarLabels,
  type CalendarSlots,
} from "./calendar-view";
import { getFirstDayOfWeek, isOutOfRange, isSameDay, parseIsoDate, toIsoDate, today, type CalendarDate } from "./date";

export interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "color"> {
  /** Selected date as an ISO string, e.g. "2026-10-19". */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  /** Earliest date that can be chosen, ISO. Also limits the year picker. */
  minValue?: string;
  /** Latest date that can be chosen, ISO. */
  maxValue?: string;
  /** Return true for dates that cannot be chosen, e.g. fully booked days. They stay focusable. */
  isDateUnavailable?: (date: string) => boolean;
  /** Month to show while nothing is selected, as any ISO date in it. @default today */
  defaultFocusedValue?: string;
  /** 0 = Sunday … 6 = Saturday. @default the locale's */
  firstDayOfWeek?: number;
  /** BCP 47 tag for month and weekday names. @default the provider's locale, else "en-US" */
  locale?: string;
  /** Days of the neighbouring months in the first and last week. @default true */
  showOutsideDays?: boolean;
  /** Accessible names of the controls, for translation. */
  labels?: Partial<CalendarLabels>;
  isDisabled?: boolean;
  /** Can be browsed but not changed. */
  isReadOnly?: boolean;
  /** Focus the selected day (or today) on mount. */
  autoFocus?: boolean;
  /** Colour of the selected day. @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  classNames?: Partial<Record<CalendarSlots, string>>;
}

/**
 * A month grid for picking a date. Arrow keys move by day and week, Page Up/Down by month (with
 * Shift by year), Home/End to the week's ends; the month and year pickers jump anywhere.
 */
export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(function Calendar(props, ref) {
  const defaults = useCenngeDefaults();
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    minValue,
    maxValue,
    isDateUnavailable,
    defaultFocusedValue,
    firstDayOfWeek,
    locale = defaults.locale ?? "en-US",
    showOutsideDays = true,
    labels,
    isDisabled = false,
    isReadOnly = false,
    autoFocus = false,
    color = defaults.color && defaults.color !== "default" ? defaults.color : "primary",
    size = defaults.size ?? "md",
    classNames,
    ...rest
  } = props;

  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const isControlled = valueProp !== undefined;
  const [innerValue, setInnerValue] = React.useState(defaultValue ?? null);
  const selected = parseIsoDate(isControlled ? valueProp : innerValue);
  const min = parseIsoDate(minValue);
  const max = parseIsoDate(maxValue);

  const { focused, setFocused, view, setView } = useCalendarFocus({
    selected,
    fallback: parseIsoDate(defaultFocusedValue) ?? today(),
    min,
    max,
    visibleMonths: 1,
  });

  const isUnavailable = (date: CalendarDate) => Boolean(isDateUnavailable?.(toIsoDate(date)));

  const select = (date: CalendarDate) => {
    if (isDisabled || isReadOnly || isOutOfRange(date, min, max) || isUnavailable(date)) return;
    setFocused(date);
    setView((current) => viewFor(date, current, 1));
    if (isSameDay(date, selected)) return;
    const iso = toIsoDate(date);
    if (!isControlled) setInnerValue(iso);
    onValueChange?.(iso);
  };

  return (
    <CalendarView
      focused={focused}
      onFocusedChange={setFocused}
      view={view}
      onViewChange={setView}
      visibleMonths={1}
      getDayState={(date) => ({ isSelected: isSameDay(date, selected) })}
      onSelect={select}
      isUnavailable={isUnavailable}
      min={min}
      max={max}
      firstDayOfWeek={firstDayOfWeek ?? getFirstDayOfWeek(locale)}
      locale={locale}
      labels={{ ...defaultCalendarLabels, ...labels }}
      showOutsideDays={showOutsideDays}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      autoFocus={autoFocus}
      size={size}
      color={color}
      classNames={classNames}
      rootRef={rootRef}
      rootProps={rest}
    />
  );
});
