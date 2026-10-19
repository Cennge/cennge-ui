import * as React from "react";
import { useCenngeDefaults } from "../../provider";
import type { CalendarProps } from "./calendar";
import { CalendarView, defaultCalendarLabels, useCalendarFocus, viewFor, type DayState } from "./calendar-view";
import {
  addDays,
  compareDates,
  dateFormatter,
  getFirstDayOfWeek,
  isOutOfRange,
  isSameDay,
  parseIsoDate,
  toIsoDate,
  toUtcDate,
  type CalendarDate,
} from "./date";

export interface DateRange {
  /** ISO date, e.g. "2026-10-19". */
  start: string;
  /** ISO date, never before `start`. */
  end: string;
}

export interface RangeCalendarProps extends Omit<CalendarProps, "value" | "defaultValue" | "onValueChange"> {
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  /** Called once both ends are chosen. */
  onValueChange?: (range: DateRange) => void;
  /** Months side by side; they wrap on narrow screens. @default 1 */
  visibleMonths?: number;
}

interface Range {
  start: CalendarDate;
  end: CalendarDate;
}

const ordered = (a: CalendarDate, b: CalendarDate): Range =>
  compareDates(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a };

export function parseRange(range: DateRange | null | undefined): Range | null {
  const start = parseIsoDate(range?.start);
  const end = parseIsoDate(range?.end);
  return start && end ? ordered(start, end) : null;
}

/** The first unavailable day inside a range, if any. */
export function firstUnavailableDay(range: Range, isUnavailable: (date: CalendarDate) => boolean): CalendarDate | null {
  for (let date = range.start; compareDates(date, range.end) <= 0; date = addDays(date, 1)) {
    if (isUnavailable(date)) return date;
  }
  return null;
}

/**
 * A month grid for picking a range: choose the start, then the end. Until the end is chosen the
 * range follows the pointer or the keyboard focus; Escape starts over.
 */
export const RangeCalendar = React.forwardRef<HTMLDivElement, RangeCalendarProps>(function RangeCalendar(props, ref) {
  const defaults = useCenngeDefaults();
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    visibleMonths = 1,
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
    onKeyDown,
    ...rest
  } = props;

  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const isControlled = valueProp !== undefined;
  const [innerValue, setInnerValue] = React.useState(defaultValue ?? null);
  const selected = parseRange(isControlled ? valueProp : innerValue);
  const min = parseIsoDate(minValue);
  const max = parseIsoDate(maxValue);

  // The first chosen end while the other is still being chosen.
  const [anchor, setAnchor] = React.useState<CalendarDate | null>(null);
  const [hovered, setHovered] = React.useState<CalendarDate | null>(null);

  const { focused, setFocused, view, setView } = useCalendarFocus({
    selected: selected?.start ?? null,
    defaultFocused: parseIsoDate(defaultFocusedValue),
    min,
    max,
    visibleMonths,
  });

  const isUnavailable = (date: CalendarDate) => Boolean(isDateUnavailable?.(toIsoDate(date)));

  const select = (date: CalendarDate) => {
    if (isDisabled || isReadOnly || isOutOfRange(date, min, max) || isUnavailable(date)) return;
    setFocused(date);
    setView((current) => viewFor(date, current, visibleMonths));
    if (!anchor) {
      setAnchor(date);
      return;
    }
    const range = ordered(anchor, date);
    if (firstUnavailableDay(range, isUnavailable)) return; // a range cannot run across an unavailable day
    setAnchor(null);
    setHovered(null);
    const next = { start: toIsoDate(range.start), end: toIsoDate(range.end) };
    if (!isControlled) setInnerValue(next);
    onValueChange?.(next);
  };

  // While the second end is being chosen, show the range up to the pointer, or the keyboard focus.
  const shown = anchor ? ordered(anchor, hovered ?? focused ?? anchor) : selected;

  const getDayState = (date: CalendarDate): DayState => {
    if (!shown) return { isSelected: false };
    const isStart = isSameDay(date, shown.start);
    const isEnd = isSameDay(date, shown.end);
    const isSingleDay = isSameDay(shown.start, shown.end);
    return {
      isSelected: isStart || isEnd,
      isRangeStart: isStart && !isSingleDay,
      isRangeEnd: isEnd && !isSingleDay,
      isRangeMiddle: compareDates(date, shown.start) > 0 && compareDates(date, shown.end) < 0,
    };
  };

  const longDate = dateFormatter(locale, { dateStyle: "long" });
  const announcement = anchor
    ? `${longDate.format(toUtcDate(anchor))} –`
    : selected
      ? longDate.formatRange(toUtcDate(selected.start), toUtcDate(selected.end))
      : "";

  return (
    <CalendarView
      focused={focused}
      onFocusedChange={setFocused}
      view={view}
      onViewChange={setView}
      visibleMonths={visibleMonths}
      getDayState={getDayState}
      onSelect={select}
      onHover={anchor ? setHovered : undefined}
      isUnavailable={isUnavailable}
      min={min}
      max={max}
      firstDayOfWeek={firstDayOfWeek ?? getFirstDayOfWeek(locale)}
      locale={locale}
      labels={{ ...defaultCalendarLabels, ...labels }}
      showOutsideDays={showOutsideDays && visibleMonths === 1}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      autoFocus={autoFocus}
      size={size}
      color={color}
      classNames={classNames}
      announcement={announcement}
      rootRef={rootRef}
      rootProps={{
        ...rest,
        // Lets a surrounding popover keep Escape for cancelling the half-chosen range.
        ...({ "data-selecting": anchor ? "" : undefined } as React.HTMLAttributes<HTMLDivElement>),
        onKeyDown: (event) => {
          onKeyDown?.(event);
          if (event.key === "Escape" && anchor) {
            event.preventDefault();
            setAnchor(null);
            setHovered(null);
          }
        },
      }}
    />
  );
});
