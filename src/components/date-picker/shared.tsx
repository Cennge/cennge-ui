import { cn } from "../../utils/cn";
import { formatDateField, parseIsoDate } from "../calendar/date";

/* Shared by DatePicker and DateRangePicker. Internal: not re-exported from the package. */

export type DatePickerError =
  | { type: "invalid"; pattern: string }
  | { type: "outOfRange"; min?: string; max?: string }
  | { type: "unavailable"; date: string };

export const calendarButtonClass = cn(
  "-mr-1.5 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-small text-muted",
  "transition-[background-color,color,transform] duration-(--cennge-duration-fast) ease-tactile motion-reduce:transition-none",
  "hover:bg-default-bg hover:text-foreground active:scale-90 data-[state=open]:bg-default-bg data-[state=open]:text-foreground",
  "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50",
);

export function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

/** English text for a refused date; dates shown the way the locale writes them. */
export function defaultDateError(error: DatePickerError | { type: "order" }, locale: string): string {
  const show = (iso?: string) => {
    const date = parseIsoDate(iso);
    return date ? formatDateField(date, locale) : "";
  };
  switch (error.type) {
    case "invalid":
      return `Enter a date as ${error.pattern}`;
    case "unavailable":
      return "This date is not available";
    case "order":
      return "The end date is before the start date";
    case "outOfRange":
      if (error.min && error.max) return `Choose a date from ${show(error.min)} to ${show(error.max)}`;
      return error.min ? `Choose a date from ${show(error.min)}` : `Choose a date until ${show(error.max)}`;
  }
}
