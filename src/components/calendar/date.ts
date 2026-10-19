/*
 * Calendar dates without a time zone: { year, month 1-12, day }. Public values are ISO strings
 * ("2026-10-19"), like <input type="date">, so they survive JSON, FormData and server actions.
 * Arithmetic runs on UTC dates, so daylight-saving changes never shift a day.
 */

export interface CalendarDate {
  year: number;
  /** 1-12 */
  month: number;
  day: number;
}

export type DateSegment = "day" | "month" | "year";

const pad = (value: number, width = 2) => String(value).padStart(width, "0");

/** A UTC midnight Date. setUTCFullYear keeps years 0-99 as they are (Date.UTC would add 1900). */
export function toUtcDate({ year, month, day }: CalendarDate): Date {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return date;
}

function fromUtcDate(date: Date): CalendarDate {
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

export function daysInMonth(year: number, month: number): number {
  const date = new Date(0);
  date.setUTCFullYear(year, month, 0); // day 0 of the next month
  return date.getUTCDate();
}

export function isValidDate(date: CalendarDate): boolean {
  const { year, month, day } = date;
  return (
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    Number.isInteger(day) &&
    year >= 1 &&
    year <= 9999 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month)
  );
}

export function toIsoDate({ year, month, day }: CalendarDate): string {
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

/** "2026-10-19" → date; anything else, including impossible dates like 2026-02-30, → null. */
export function parseIsoDate(value: string | null | undefined): CalendarDate | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  return isValidDate(date) ? date : null;
}

export function compareDates(a: CalendarDate, b: CalendarDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

export const isSameDay = (a: CalendarDate | null | undefined, b: CalendarDate | null | undefined) =>
  Boolean(a && b && compareDates(a, b) === 0);

export const isSameMonth = (a: CalendarDate, b: CalendarDate) => a.year === b.year && a.month === b.month;

export function addDays(date: CalendarDate, amount: number): CalendarDate {
  const utc = toUtcDate(date);
  utc.setUTCDate(utc.getUTCDate() + amount);
  return fromUtcDate(utc);
}

/** Keeps the day where it can: Jan 31 + 1 month = Feb 28 (or 29). */
export function addMonths(date: CalendarDate, amount: number): CalendarDate {
  const index = date.year * 12 + (date.month - 1) + amount;
  const year = Math.floor(index / 12);
  const month = index - year * 12 + 1;
  return { year, month, day: Math.min(date.day, daysInMonth(year, month)) };
}

export const addYears = (date: CalendarDate, amount: number) => addMonths(date, amount * 12);

export const startOfMonth = (date: CalendarDate): CalendarDate => ({ ...date, day: 1 });

/** 0 = Sunday … 6 = Saturday */
export const dayOfWeek = (date: CalendarDate) => toUtcDate(date).getUTCDay();

export function startOfWeek(date: CalendarDate, firstDayOfWeek: number): CalendarDate {
  return addDays(date, -((dayOfWeek(date) - firstDayOfWeek + 7) % 7));
}

export const endOfWeek = (date: CalendarDate, firstDayOfWeek: number) => addDays(startOfWeek(date, firstDayOfWeek), 6);

export function clampDate(date: CalendarDate, min?: CalendarDate | null, max?: CalendarDate | null): CalendarDate {
  if (min && compareDates(date, min) < 0) return min;
  if (max && compareDates(date, max) > 0) return max;
  return date;
}

export function isOutOfRange(date: CalendarDate, min?: CalendarDate | null, max?: CalendarDate | null): boolean {
  return Boolean((min && compareDates(date, min) < 0) || (max && compareDates(date, max) > 0));
}

/** Today in the user's time zone. */
export function today(): CalendarDate {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

/* ---------------------------------------------------------------- locale */

/*
 * First day of the week by region (CLDR). Used where Intl.Locale has no week info yet (Firefox).
 * Regions not listed start on Monday.
 */
const SUNDAY_FIRST = new Set(
  (
    "AG AS BD BR BS BT BW BZ CA CO DM DO ET GT GU HK HN ID IL IN JM JP KE KH KR LA MH MM MO MT MX MZ " +
    "NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW"
  ).split(" "),
);
const SATURDAY_FIRST = new Set("AE AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY".split(" "));

/** 0 = Sunday … 6 = Saturday */
export function getFirstDayOfWeek(locale: string): number {
  try {
    const intlLocale = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const info = intlLocale.getWeekInfo?.() ?? intlLocale.weekInfo;
    if (info) return info.firstDay % 7; // Intl counts Monday = 1 … Sunday = 7
    const region = intlLocale.maximize().region ?? "";
    if (SUNDAY_FIRST.has(region)) return 0;
    if (SATURDAY_FIRST.has(region)) return 6;
  } catch {
    // An invalid locale tag: fall through to Monday.
  }
  return 1;
}

export interface DateFieldFormat {
  /** Order of the numbers in a typed date, e.g. day, month, year for "19.10.2026". */
  order: DateSegment[];
  /** Pattern to show as a placeholder, e.g. "DD.MM.YYYY" or "MM/DD/YYYY". */
  pattern: string;
}

const formatCache = new Map<string, Intl.DateTimeFormat>();

/** Cached Intl.DateTimeFormat in UTC: dates here carry no time zone. */
export function dateFormatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let formatter = formatCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" });
    formatCache.set(key, formatter);
  }
  return formatter;
}

const NUMERIC_DATE: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit" };

export function getDateFieldFormat(locale: string): DateFieldFormat {
  const parts = dateFormatter(locale, NUMERIC_DATE).formatToParts(toUtcDate({ year: 2026, month: 12, day: 31 }));
  const order: DateSegment[] = [];
  let pattern = "";
  for (const part of parts) {
    if (part.type === "day" || part.type === "month" || part.type === "year") {
      order.push(part.type);
      pattern += part.type === "year" ? "YYYY" : part.type === "month" ? "MM" : "DD";
    } else if (part.type === "literal") {
      pattern += part.value;
    }
  }
  return { order: order.length === 3 ? order : ["year", "month", "day"], pattern: pattern.trim() };
}

/** The date as the locale writes it in numbers, e.g. "19.10.2026" or "10/19/2026". */
export function formatDateField(date: CalendarDate, locale: string): string {
  return dateFormatter(locale, NUMERIC_DATE).format(toUtcDate(date));
}

/** Two-digit years land within 80 years back and 20 years ahead of `reference`. */
function expandYear(year: number, digits: number, reference: number): number {
  if (digits > 2) return year;
  const century = Math.floor(reference / 100) * 100;
  let full = century + year;
  if (full > reference + 20) full -= 100;
  return full;
}

/**
 * Reads a typed date in the locale's order, whatever the separators: "19.10.2026", "19/10/26",
 * "19 10 2026" and "19102026" all give 19 October 2026 in ru-RU. ISO "2026-10-19" always works.
 */
export function parseDateField(text: string, locale: string, reference: CalendarDate = today()): CalendarDate | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  if (iso) {
    const date = { year: Number(iso[1]), month: Number(iso[2]), day: Number(iso[3]) };
    return isValidDate(date) ? date : null;
  }

  const { order } = getDateFieldFormat(locale);
  const groups = trimmed.match(/\d+/g) ?? [];
  const values: Partial<Record<DateSegment, { value: number; digits: number }>> = {};
  const [onlyGroup] = groups;
  if (groups.length === 1 && onlyGroup && (onlyGroup.length === 8 || onlyGroup.length === 6)) {
    // Digits only, as typed on a phone's number pad: two each for day and month, four or two for the year.
    const yearDigits = onlyGroup.length === 8 ? 4 : 2;
    let index = 0;
    for (const segment of order) {
      const width = segment === "year" ? yearDigits : 2;
      values[segment] = { value: Number(onlyGroup.slice(index, index + width)), digits: width };
      index += width;
    }
  } else if (groups.length === 3) {
    order.forEach((segment, index) => {
      const group = groups[index] ?? "";
      values[segment] = { value: Number(group), digits: group.length };
    });
  } else {
    return null;
  }

  const { day, month, year } = values;
  if (!day || !month || !year || day.digits > 2 || month.digits > 2 || year.digits === 3 || year.digits > 4) return null;
  const date = { year: expandYear(year.value, year.digits, reference.year), month: month.value, day: day.value };
  return isValidDate(date) ? date : null;
}
