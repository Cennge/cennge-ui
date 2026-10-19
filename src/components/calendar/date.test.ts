import {
  addDays,
  addMonths,
  addYears,
  daysInMonth,
  endOfWeek,
  formatDateField,
  getDateFieldFormat,
  getFirstDayOfWeek,
  parseDateField,
  parseIsoDate,
  startOfWeek,
  toIsoDate,
} from "./date";

const d = (year: number, month: number, day: number) => ({ year, month, day });
const reference = d(2026, 10, 19);

describe("calendar dates", () => {
  it("reads and writes ISO dates, refusing impossible ones", () => {
    expect(parseIsoDate("2026-10-19")).toEqual(d(2026, 10, 19));
    expect(toIsoDate(d(2026, 1, 5))).toBe("2026-01-05");
    expect(toIsoDate(d(33, 1, 5))).toBe("0033-01-05");
    expect(parseIsoDate("2026-02-30")).toBeNull();
    expect(parseIsoDate("2026-2-3")).toBeNull();
    expect(parseIsoDate("")).toBeNull();
  });

  it("knows leap years and keeps years below 100 as they are", () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(1900, 2)).toBe(28);
    expect(daysInMonth(2000, 2)).toBe(29);
    expect(addDays(d(99, 12, 31), 1)).toEqual(d(100, 1, 1));
  });

  it("adds days, months and years across boundaries", () => {
    expect(addDays(d(2026, 12, 31), 1)).toEqual(d(2027, 1, 1));
    expect(addDays(d(2026, 3, 1), -1)).toEqual(d(2026, 2, 28));
    expect(addMonths(d(2026, 1, 31), 1)).toEqual(d(2026, 2, 28));
    expect(addMonths(d(2026, 1, 15), -1)).toEqual(d(2025, 12, 15));
    expect(addMonths(d(2026, 3, 31), -13)).toEqual(d(2025, 2, 28));
    expect(addYears(d(2024, 2, 29), 1)).toEqual(d(2025, 2, 28));
  });

  it("is not shifted by daylight-saving changes", () => {
    // Europe and the US switch clocks in March and October/November.
    let date = d(2026, 3, 1);
    for (let i = 0; i < 61; i++) date = addDays(date, 1);
    expect(date).toEqual(d(2026, 5, 1));
  });

  it("finds the week around a date for either first weekday", () => {
    // 2026-10-19 is a Monday.
    expect(startOfWeek(d(2026, 10, 21), 1)).toEqual(d(2026, 10, 19));
    expect(startOfWeek(d(2026, 10, 21), 0)).toEqual(d(2026, 10, 18));
    expect(endOfWeek(d(2026, 10, 21), 1)).toEqual(d(2026, 10, 25));
  });

  it("starts weeks on Monday in Russia and Germany, Sunday in the US, Saturday in Egypt", () => {
    expect(getFirstDayOfWeek("ru-RU")).toBe(1);
    expect(getFirstDayOfWeek("de-DE")).toBe(1);
    expect(getFirstDayOfWeek("en-US")).toBe(0);
    expect(getFirstDayOfWeek("ar-EG")).toBe(6);
    expect(getFirstDayOfWeek("not a locale")).toBe(1);
  });

  it("formats dates the way each locale writes them", () => {
    expect(formatDateField(d(2026, 10, 9), "ru-RU")).toBe("09.10.2026");
    expect(formatDateField(d(2026, 10, 9), "en-US")).toBe("10/09/2026");
    expect(getDateFieldFormat("ru-RU")).toEqual({ order: ["day", "month", "year"], pattern: "DD.MM.YYYY" });
    expect(getDateFieldFormat("en-US")).toEqual({ order: ["month", "day", "year"], pattern: "MM/DD/YYYY" });
    expect(getDateFieldFormat("ja-JP").order).toEqual(["year", "month", "day"]);
  });

  it("reads typed dates in the locale's order, whatever the separators", () => {
    for (const text of ["19.10.2026", "19/10/2026", "19 10 2026", "19-10-26", "19102026", "191026", " 19.10.2026 "]) {
      expect(parseDateField(text, "ru-RU", reference)).toEqual(d(2026, 10, 19));
    }
    expect(parseDateField("10/19/2026", "en-US", reference)).toEqual(d(2026, 10, 19));
    expect(parseDateField("2026/10/19", "ja-JP", reference)).toEqual(d(2026, 10, 19));
    expect(parseDateField("2026-10-19", "en-US", reference)).toEqual(d(2026, 10, 19));
    expect(parseDateField("1.2.2026", "ru-RU", reference)).toEqual(d(2026, 2, 1));
  });

  it("puts two-digit years within 80 years back and 20 ahead", () => {
    expect(parseDateField("01.01.46", "ru-RU", reference)?.year).toBe(2046);
    expect(parseDateField("01.01.47", "ru-RU", reference)?.year).toBe(1947);
    expect(parseDateField("01.01.99", "ru-RU", reference)?.year).toBe(1999);
  });

  it("refuses text that is not a date", () => {
    for (const text of ["", "31.02.2026", "19.10", "19.10.2026.1", "abc", "123.10.2026", "19.10.202"]) {
      expect(parseDateField(text, "ru-RU", reference)).toBeNull();
    }
  });
});
