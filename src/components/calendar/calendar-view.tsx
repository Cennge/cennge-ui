import * as React from "react";
import { tv } from "../../utils/tv";
import type { CenngeColor, CenngeSize } from "../../types";
import {
  addDays,
  addMonths,
  addYears,
  clampDate,
  compareDates,
  dateFormatter,
  daysInMonth,
  endOfWeek,
  isOutOfRange,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  toIsoDate,
  toUtcDate,
  today,
  type CalendarDate,
} from "./date";

/*
 * The month grid shared by Calendar and RangeCalendar: header with month and year pickers, the
 * WAI-ARIA date grid and its keyboard. Selection itself belongs to the wrapping component.
 */

export interface CalendarLabels {
  /** @default "Previous month" */
  previousMonth: string;
  /** @default "Next month" */
  nextMonth: string;
  /** Name of the month picker. @default "Month" */
  month: string;
  /** Name of the year picker. @default "Year" */
  year: string;
}

export const defaultCalendarLabels: CalendarLabels = {
  previousMonth: "Previous month",
  nextMonth: "Next month",
  month: "Month",
  year: "Year",
};

export type CalendarSlots =
  | "base"
  | "header"
  | "navButton"
  | "picker"
  | "months"
  | "grid"
  | "weekday"
  | "cell"
  | "day";

/* Literal strings per colour, so Tailwind can find them. */
const selectedDay: Record<CenngeColor, string> = {
  default:
    "data-[selected]:bg-default data-[selected]:text-default-foreground data-[selected]:hover:bg-default data-[today]:not-data-[selected]:text-default-text",
  primary:
    "data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[today]:not-data-[selected]:text-primary-text",
  secondary:
    "data-[selected]:bg-secondary data-[selected]:text-secondary-foreground data-[selected]:hover:bg-secondary data-[today]:not-data-[selected]:text-secondary-text",
  success:
    "data-[selected]:bg-success data-[selected]:text-success-foreground data-[selected]:hover:bg-success data-[today]:not-data-[selected]:text-success-text",
  warning:
    "data-[selected]:bg-warning data-[selected]:text-warning-foreground data-[selected]:hover:bg-warning data-[today]:not-data-[selected]:text-warning-text",
  danger:
    "data-[selected]:bg-danger data-[selected]:text-danger-foreground data-[selected]:hover:bg-danger data-[today]:not-data-[selected]:text-danger-text",
  info: "data-[selected]:bg-info data-[selected]:text-info-foreground data-[selected]:hover:bg-info data-[today]:not-data-[selected]:text-info-text",
};

export const calendarStyles = tv({
  slots: {
    base: "inline-flex max-w-full flex-col gap-2 select-none",
    header: "flex items-center gap-1",
    navButton: [
      "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-medium text-muted",
      "transition-[background-color,color,transform] duration-(--cennge-duration-fast) ease-tactile motion-reduce:transition-none",
      "hover:bg-default-bg hover:text-foreground active:scale-90",
      "outline-none focus-visible:outline-2 focus-visible:outline-ring",
      "disabled:pointer-events-none disabled:opacity-35",
    ],
    pickers: "flex min-w-0 flex-1 items-center justify-center gap-0.5",
    pickerWrapper: "relative",
    picker: [
      "h-8 cursor-pointer appearance-none rounded-medium bg-transparent py-0 pr-6 pl-2 text-sm font-semibold text-foreground",
      "transition-colors duration-(--cennge-duration-fast) hover:bg-default-bg",
      "outline-none focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none",
    ],
    pickerIcon: "pointer-events-none absolute top-1/2 right-1.5 size-3.5 -translate-y-1/2 text-muted",
    monthTitle: "flex h-8 flex-1 items-center justify-center text-sm font-semibold",
    months: "flex flex-wrap gap-4",
    month: "flex flex-col gap-2",
    grid: "border-separate border-spacing-0",
    weekday: "pb-1 text-center text-xs font-medium text-muted",
    cell: [
      "p-0 text-center",
      "data-[range-middle]:bg-(--cennge-range-band)",
      "data-[range-start]:bg-linear-to-r data-[range-start]:from-transparent data-[range-start]:from-50% data-[range-start]:to-(--cennge-range-band) data-[range-start]:to-50%",
      "data-[range-end]:bg-linear-to-l data-[range-end]:from-transparent data-[range-end]:from-50% data-[range-end]:to-(--cennge-range-band) data-[range-end]:to-50%",
      // The band ends with the week: rounded at the row's edges, no half band leading nowhere.
      "first:data-[range-middle]:rounded-l-medium last:data-[range-middle]:rounded-r-medium",
      "last:data-[range-start]:bg-none first:data-[range-end]:bg-none",
    ],
    day: [
      "relative mx-auto flex cursor-pointer items-center justify-center rounded-medium text-foreground tabular-nums",
      "transition-[background-color,color,transform] duration-(--cennge-duration-fast) ease-tactile motion-reduce:transition-none",
      "hover:bg-default-bg active:scale-95",
      "outline-none focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
      "data-[selected]:inset-shadow-tactile data-[outside]:text-muted",
      "data-[unavailable]:cursor-not-allowed data-[unavailable]:text-muted data-[unavailable]:line-through data-[unavailable]:hover:bg-transparent",
      "disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent",
      // Today: bold, in the accent text colour, with a dot under the number.
      "data-[today]:font-bold data-[today]:after:absolute data-[today]:after:bottom-1 data-[today]:after:size-1 data-[today]:after:rounded-full data-[today]:after:bg-current",
    ],
  },
  variants: {
    size: {
      sm: { day: "size-8 text-xs", weekday: "w-8" },
      md: { day: "size-9 text-sm", weekday: "w-9" },
      lg: { day: "size-11 text-base", weekday: "w-11" },
    },
    color: {
      default: { base: "[--cennge-range-band:color-mix(in_oklab,var(--cennge-default-500)_14%,transparent)]", day: selectedDay.default },
      primary: { base: "[--cennge-range-band:color-mix(in_oklab,var(--cennge-primary)_14%,transparent)]", day: selectedDay.primary },
      secondary: { base: "[--cennge-range-band:color-mix(in_oklab,var(--cennge-secondary)_14%,transparent)]", day: selectedDay.secondary },
      success: { base: "[--cennge-range-band:color-mix(in_oklab,var(--cennge-success)_14%,transparent)]", day: selectedDay.success },
      warning: { base: "[--cennge-range-band:color-mix(in_oklab,var(--cennge-warning)_14%,transparent)]", day: selectedDay.warning },
      danger: { base: "[--cennge-range-band:color-mix(in_oklab,var(--cennge-danger)_14%,transparent)]", day: selectedDay.danger },
      info: { base: "[--cennge-range-band:color-mix(in_oklab,var(--cennge-info)_14%,transparent)]", day: selectedDay.info },
    },
  },
  defaultVariants: { size: "md", color: "primary" },
});

export interface DayState {
  isSelected: boolean;
  /** Between the ends of a range (not the ends themselves). */
  isRangeMiddle?: boolean;
  isRangeStart?: boolean;
  isRangeEnd?: boolean;
}

export interface CalendarViewProps {
  focused: CalendarDate;
  onFocusedChange: (date: CalendarDate) => void;
  /** First visible month. */
  view: CalendarDate;
  onViewChange: (view: CalendarDate) => void;
  visibleMonths: number;
  getDayState: (date: CalendarDate) => DayState;
  onSelect: (date: CalendarDate) => void;
  onHover?: (date: CalendarDate | null) => void;
  isUnavailable: (date: CalendarDate) => boolean;
  min: CalendarDate | null;
  max: CalendarDate | null;
  firstDayOfWeek: number;
  locale: string;
  labels: CalendarLabels;
  showOutsideDays: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  autoFocus: boolean;
  size: CenngeSize;
  color: CenngeColor;
  classNames?: Partial<Record<CalendarSlots, string>>;
  /** Read out by screen readers when it changes, e.g. the chosen range. */
  announcement?: string;
  /** The root element; also used to move focus between days. */
  rootRef: React.RefObject<HTMLDivElement | null>;
  rootProps: React.HTMLAttributes<HTMLDivElement>;
}

const capitalize = (text: string, locale: string) => text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);

function ChevronIcon({ direction }: { direction: "left" | "right" | "down" }) {
  const d = direction === "left" ? "M15 6l-6 6 6 6" : direction === "right" ? "M9 6l6 6-6 6" : "M6 9l6 6 6-6";
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Focused day and first visible month. Follows `selected` when it changes from outside, e.g. a
 * date typed into a DatePicker's field.
 */
export function useCalendarFocus(options: {
  selected: CalendarDate | null;
  fallback: CalendarDate;
  min: CalendarDate | null;
  max: CalendarDate | null;
  visibleMonths: number;
}) {
  const { selected, fallback, min, max, visibleMonths } = options;
  const [focused, setFocused] = React.useState(() => clampDate(selected ?? fallback, min, max));
  const [view, setView] = React.useState(() => startOfMonth(clampDate(selected ?? fallback, min, max)));
  const selectedIso = selected ? toIsoDate(selected) : null;
  React.useEffect(() => {
    if (!selected) return;
    const next = clampDate(selected, min, max);
    setFocused(next);
    setView((current) => viewFor(next, current, visibleMonths));
  }, [selectedIso]); // only when the selection itself changes
  return { focused: clampDate(focused, min, max), setFocused, view, setView };
}

/** Keeps the focused date inside the visible months by moving the view as little as possible. */
export function viewFor(focused: CalendarDate, view: CalendarDate, visibleMonths: number): CalendarDate {
  const first = startOfMonth(view);
  const last = addMonths(first, visibleMonths - 1);
  if (compareDates(focused, first) < 0) return startOfMonth(focused);
  if (compareDates(startOfMonth(focused), last) > 0) return addMonths(startOfMonth(focused), -(visibleMonths - 1));
  return first;
}

export function CalendarView(props: CalendarViewProps) {
  const {
    focused,
    onFocusedChange,
    view,
    onViewChange,
    visibleMonths,
    getDayState,
    onSelect,
    onHover,
    isUnavailable,
    min,
    max,
    firstDayOfWeek,
    locale,
    labels,
    showOutsideDays,
    isDisabled,
    isReadOnly,
    autoFocus,
    size,
    color,
    classNames,
    announcement,
    rootRef,
    rootProps,
  } = props;

  const focusAfterRender = React.useRef(autoFocus);
  const now = today();

  // Moving with the keyboard re-renders the grid; then focus follows to the new day.
  React.useEffect(() => {
    if (!focusAfterRender.current) return;
    focusAfterRender.current = false;
    rootRef.current
      ?.querySelector<HTMLButtonElement>(`[data-date="${toIsoDate(focused)}"]:not([data-outside])`)
      ?.focus();
  });

  const moveFocus = (date: CalendarDate) => {
    const next = clampDate(date, min, max);
    focusAfterRender.current = true;
    onFocusedChange(next);
    onViewChange(viewFor(next, view, visibleMonths));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case "ArrowLeft":
        moveFocus(addDays(focused, -1));
        break;
      case "ArrowRight":
        moveFocus(addDays(focused, 1));
        break;
      case "ArrowUp":
        moveFocus(addDays(focused, -7));
        break;
      case "ArrowDown":
        moveFocus(addDays(focused, 7));
        break;
      case "Home":
        moveFocus(startOfWeek(focused, firstDayOfWeek));
        break;
      case "End":
        moveFocus(endOfWeek(focused, firstDayOfWeek));
        break;
      case "PageUp":
        moveFocus(event.shiftKey ? addYears(focused, -1) : addMonths(focused, -1));
        break;
      case "PageDown":
        moveFocus(event.shiftKey ? addYears(focused, 1) : addMonths(focused, 1));
        break;
      default:
        return; // Enter and Space reach the button as a click.
    }
    event.preventDefault();
  };

  // Month buttons and pickers move the view; the focused day keeps its number where the month has it.
  const showMonth = (month: CalendarDate) => {
    const target = startOfMonth(month);
    onViewChange(target);
    onFocusedChange(clampDate({ ...target, day: Math.min(focused.day, daysInMonth(target.year, target.month)) }, min, max));
  };

  const canGoBack = !min || compareDates(addDays(startOfMonth(view), -1), min) >= 0;
  const lastVisible = addMonths(startOfMonth(view), visibleMonths - 1);
  const canGoForward = !max || compareDates(addMonths(lastVisible, 1), max) <= 0;

  const slots = calendarStyles({ size, color });
  const numberFormat = new Intl.NumberFormat(locale, { useGrouping: false });
  const monthName = (month: number) =>
    capitalize(dateFormatter(locale, { month: "long" }).format(toUtcDate({ year: 2026, month, day: 1 })), locale);
  const monthTitle = (month: CalendarDate) =>
    capitalize(dateFormatter(locale, { month: "long", year: "numeric" }).format(toUtcDate(month)), locale);
  const fullDate = dateFormatter(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  // Weekday headers, starting on the locale's first day. 2026-10-18 is a Sunday.
  const weekdays = Array.from({ length: 7 }, (_, index) => {
    const date = toUtcDate(addDays({ year: 2026, month: 10, day: 18 }, (firstDayOfWeek + index) % 7));
    return {
      short: capitalize(dateFormatter(locale, { weekday: "short" }).format(date), locale),
      long: dateFormatter(locale, { weekday: "long" }).format(date),
    };
  });

  // Years in the picker: a wide window around today, widened to reach the shown year, bounded by min/max.
  const shownYear = view.year;
  const firstYear = min?.year ?? Math.min(now.year - 120, shownYear);
  const lastYear = max?.year ?? Math.max(now.year + 30, shownYear);
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => firstYear + index);

  const previousButton = (
    <button
      type="button"
      aria-label={labels.previousMonth}
      disabled={isDisabled || !canGoBack}
      onClick={() => showMonth(addMonths(view, -1))}
      className={slots.navButton({ class: classNames?.navButton })}
    >
      <ChevronIcon direction="left" />
    </button>
  );
  const nextButton = (
    <button
      type="button"
      aria-label={labels.nextMonth}
      disabled={isDisabled || !canGoForward}
      onClick={() => showMonth(addMonths(view, 1))}
      className={slots.navButton({ class: classNames?.navButton })}
    >
      <ChevronIcon direction="right" />
    </button>
  );
  const pickers = (
    <div className={slots.pickers()}>
      <div className={slots.pickerWrapper()}>
        <select
          aria-label={labels.month}
          value={view.month}
          disabled={isDisabled}
          onChange={(event) => showMonth({ ...view, month: Number(event.target.value), day: 1 })}
          className={slots.picker({ class: classNames?.picker })}
        >
          {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
            <option
              key={month}
              value={month}
              disabled={isOutOfRange({ year: view.year, month, day: 1 }, min ? startOfMonth(min) : null, max)}
            >
              {monthName(month)}
            </option>
          ))}
        </select>
        <span className={slots.pickerIcon()}>
          <ChevronIcon direction="down" />
        </span>
      </div>
      <div className={slots.pickerWrapper()}>
        <select
          aria-label={labels.year}
          value={view.year}
          disabled={isDisabled}
          onChange={(event) =>
            showMonth(clampDate({ ...view, year: Number(event.target.value), day: 1 }, min ? startOfMonth(min) : null, max))
          }
          className={slots.picker({ class: classNames?.picker })}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {numberFormat.format(year)}
            </option>
          ))}
        </select>
        <span className={slots.pickerIcon()}>
          <ChevronIcon direction="down" />
        </span>
      </div>
    </div>
  );
  // Keeps a header's middle centred when it has a button on one side only.
  const spacer = <span aria-hidden="true" className="size-8 shrink-0" />;

  const renderMonth = (monthStart: CalendarDate, index: number) => {
    const gridStart = startOfWeek(monthStart, firstDayOfWeek);
    const weeks = Array.from({ length: 6 }, (_, week) =>
      Array.from({ length: 7 }, (_, day) => addDays(gridStart, week * 7 + day)),
    );
    return (
      <div key={toIsoDate(monthStart)} className={slots.month()}>
        <div className={slots.header({ class: classNames?.header })}>
          {index === 0 ? previousButton : spacer}
          {index === 0 ? (
            pickers
          ) : (
            <div className={slots.monthTitle()} aria-hidden="true">
              {monthTitle(monthStart)}
            </div>
          )}
          {index === visibleMonths - 1 ? nextButton : spacer}
        </div>
        <table
          role="grid"
          aria-label={monthTitle(monthStart)}
          aria-disabled={isDisabled || undefined}
          aria-readonly={isReadOnly || undefined}
          className={slots.grid({ class: classNames?.grid })}
        >
          <thead>
            <tr>
              {weekdays.map((weekday) => (
                <th key={weekday.long} scope="col" abbr={weekday.long} className={slots.weekday({ class: classNames?.weekday })}>
                  {weekday.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={toIsoDate(week[0] ?? monthStart)}>
                {week.map((date) => {
                  const iso = toIsoDate(date);
                  const isOutside = !isSameMonth(date, monthStart);
                  if (isOutside && !showOutsideDays) {
                    return <td key={iso} role="gridcell" className={slots.cell({ class: classNames?.cell })} />;
                  }
                  const state = getDayState(date);
                  const unavailable = isUnavailable(date);
                  const outOfRange = isOutOfRange(date, min, max);
                  const isFocusTarget = !isOutside && isSameDay(date, focused);
                  return (
                    <td
                      key={iso}
                      role="gridcell"
                      aria-selected={state.isSelected || state.isRangeMiddle || undefined}
                      data-range-middle={(!isOutside && state.isRangeMiddle) || undefined}
                      data-range-start={(!isOutside && state.isRangeStart) || undefined}
                      data-range-end={(!isOutside && state.isRangeEnd) || undefined}
                      className={slots.cell({ class: classNames?.cell })}
                    >
                      <button
                        type="button"
                        data-date={iso}
                        data-outside={isOutside || undefined}
                        data-today={isSameDay(date, now) || undefined}
                        data-selected={state.isSelected || undefined}
                        data-range-middle={state.isRangeMiddle || undefined}
                        data-range-start={state.isRangeStart || undefined}
                        data-range-end={state.isRangeEnd || undefined}
                        data-unavailable={unavailable || undefined}
                        tabIndex={isFocusTarget && !isDisabled ? 0 : -1}
                        disabled={isDisabled || outOfRange}
                        aria-disabled={unavailable || undefined}
                        aria-current={isSameDay(date, now) ? "date" : undefined}
                        aria-label={fullDate.format(toUtcDate(date))}
                        onClick={() => {
                          // A neighbouring month's day switches the month: keep focus on the grid.
                          if (isOutside) focusAfterRender.current = true;
                          onSelect(date);
                        }}
                        onFocus={() => {
                          if (!isOutside && !isSameDay(date, focused)) onFocusedChange(date);
                        }}
                        onKeyDown={handleKeyDown}
                        onPointerEnter={onHover ? () => onHover(date) : undefined}
                        className={slots.day({ class: classNames?.day })}
                      >
                        {numberFormat.format(date.day)}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const months = Array.from({ length: visibleMonths }, (_, index) => addMonths(startOfMonth(view), index));
  const { className: rootClassName, ...restRootProps } = rootProps;

  return (
    <div
      // A group, so the calendar can carry a name such as "Release date".
      role="group"
      {...restRootProps}
      ref={rootRef}
      className={slots.base({ class: [classNames?.base, rootClassName] })}
      data-disabled={isDisabled || undefined}
      onPointerLeave={onHover ? () => onHover(null) : undefined}
    >
      {/* Read out when the shown month changes. */}
      <div className="sr-only" aria-live="polite">
        {months.map((month) => monthTitle(month)).join(" – ")}
      </div>
      {announcement !== undefined ? (
        <div className="sr-only" aria-live="polite">
          {announcement}
        </div>
      ) : null}
      <div className={slots.months({ class: classNames?.months })}>{months.map(renderMonth)}</div>
    </div>
  );
}
