/*
 * Times of day without a date or time zone: { hour 0-23, minute 0-59 }. Public values are
 * "HH:mm" strings, like <input type="time">.
 */

export interface TimeOfDay {
  hour: number;
  minute: number;
}

export type TimeSegment = "hour" | "minute" | "dayPeriod";

const pad = (value: number) => String(value).padStart(2, "0");

export const toIsoTime = ({ hour, minute }: TimeOfDay) => `${pad(hour)}:${pad(minute)}`;

export function parseIsoTime(value: string | null | undefined): TimeOfDay | null {
  const match = value ? /^(\d{2}):(\d{2})$/.exec(value) : null;
  if (!match) return null;
  const time = { hour: Number(match[1]), minute: Number(match[2]) };
  return time.hour < 24 && time.minute < 60 ? time : null;
}

export const toMinutes = ({ hour, minute }: TimeOfDay) => hour * 60 + minute;

export function fromMinutes(total: number): TimeOfDay {
  const wrapped = ((total % 1440) + 1440) % 1440;
  return { hour: Math.floor(wrapped / 60), minute: wrapped % 60 };
}

/** Whether the locale writes times with AM/PM. */
export function usesDayPeriod(locale: string): boolean {
  const cycle = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hourCycle;
  return cycle === "h12" || cycle === "h11";
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function timeFormatter(locale: string, hour12: boolean): Intl.DateTimeFormat {
  const key = `${locale}|${hour12}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      hour: hour12 ? "numeric" : "2-digit",
      minute: "2-digit",
      hourCycle: hour12 ? "h12" : "h23",
      timeZone: "UTC",
    });
    formatters.set(key, formatter);
  }
  return formatter;
}

const asDate = ({ hour, minute }: TimeOfDay) => new Date(Date.UTC(2026, 0, 1, hour, minute));

/** "14:30" in ru-RU, "2:30 PM" in en-US. */
export function formatTime(time: TimeOfDay, locale: string, hour12: boolean): string {
  return timeFormatter(locale, hour12).format(asDate(time));
}

/** Where each segment sits in the formatted text, for arrow keys that change the segment at the caret. */
export function timeSegments(time: TimeOfDay, locale: string, hour12: boolean) {
  const segments: { type: TimeSegment; start: number; end: number }[] = [];
  let offset = 0;
  for (const part of timeFormatter(locale, hour12).formatToParts(asDate(time))) {
    if (part.type === "hour" || part.type === "minute" || part.type === "dayPeriod") {
      segments.push({ type: part.type, start: offset, end: offset + part.value.length });
    }
    offset += part.value.length;
  }
  return segments;
}

/** The locale's AM and PM words, lower-cased, for reading typed text. */
function dayPeriodWords(locale: string): { am: string[]; pm: string[] } {
  const words = (hour: number) =>
    timeFormatter(locale, true)
      .formatToParts(asDate({ hour, minute: 0 }))
      .filter((part) => part.type === "dayPeriod")
      .map((part) => part.value.toLocaleLowerCase(locale).replace(/\s+/g, " ").trim());
  return { am: [...words(9), "am", "a.m.", "a"], pm: [...words(15), "pm", "p.m.", "p"] };
}

/** "HH:MM" or "HH:MM AM" in the locale's AM word, as a placeholder. */
export function timePattern(locale: string, hour12: boolean): string {
  if (!hour12) return "HH:MM";
  const [am] = timeFormatter(locale, true)
    .formatToParts(asDate({ hour: 9, minute: 0 }))
    .filter((part) => part.type === "dayPeriod")
    .map((part) => part.value);
  return `HH:MM ${am ?? "AM"}`;
}

/**
 * Reads a typed time: "14:30", "14.30", "1430", "930", "9", "2:30 pm", "2p", "12 am".
 * Without AM/PM the hour is read on a 24-hour clock.
 */
export function parseTimeText(text: string, locale: string): TimeOfDay | null {
  let rest = text.trim().toLocaleLowerCase(locale);
  if (!rest) return null;

  let period: "am" | "pm" | null = null;
  const { am, pm } = dayPeriodWords(locale);
  const markers = [...am.map((word) => ({ word, period: "am" as const })), ...pm.map((word) => ({ word, period: "pm" as const }))]
    .filter((marker) => marker.word)
    .sort((a, b) => b.word.length - a.word.length);
  for (const marker of markers) {
    // Latin single letters only count at the very end ("2p"), so they never eat part of a word.
    const index = marker.word.length === 1 ? (rest.endsWith(marker.word) ? rest.length - 1 : -1) : rest.indexOf(marker.word);
    if (index >= 0) {
      period = marker.period;
      rest = rest.slice(0, index) + rest.slice(index + marker.word.length);
      break;
    }
  }

  const groups = rest.match(/\d+/g) ?? [];
  if (/[^\d\s:.,h]/.test(rest)) return null; // letters that are not a day period
  let hour: number;
  let minute = 0;
  const [first, second] = groups;
  if (groups.length === 1 && first) {
    if (first.length <= 2) hour = Number(first);
    else if (first.length === 3) [hour, minute] = [Number(first.slice(0, 1)), Number(first.slice(1))];
    else if (first.length === 4) [hour, minute] = [Number(first.slice(0, 2)), Number(first.slice(2))];
    else return null;
  } else if (groups.length === 2 && first && second && first.length <= 2 && second.length === 2) {
    [hour, minute] = [Number(first), Number(second)];
  } else {
    return null;
  }

  if (period) {
    if (hour < 1 || hour > 12) return null;
    hour = (hour % 12) + (period === "pm" ? 12 : 0);
  }
  return hour < 24 && minute < 60 ? { hour, minute } : null;
}
