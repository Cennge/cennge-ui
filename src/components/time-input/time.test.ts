import { formatTime, fromMinutes, parseIsoTime, parseTimeText, timePattern, timeSegments, toIsoTime, usesDayPeriod } from "./time";

const t = (hour: number, minute: number) => ({ hour, minute });

describe("times of day", () => {
  it("reads and writes HH:mm, refusing impossible times", () => {
    expect(parseIsoTime("09:05")).toEqual(t(9, 5));
    expect(toIsoTime(t(9, 5))).toBe("09:05");
    expect(parseIsoTime("24:00")).toBeNull();
    expect(parseIsoTime("9:05")).toBeNull();
  });

  it("wraps around midnight", () => {
    expect(fromMinutes(-15)).toEqual(t(23, 45));
    expect(fromMinutes(1440 + 30)).toEqual(t(0, 30));
  });

  it("knows which locales use AM/PM and formats accordingly", () => {
    expect(usesDayPeriod("en-US")).toBe(true);
    expect(usesDayPeriod("ru-RU")).toBe(false);
    expect(formatTime(t(14, 30), "ru-RU", false)).toBe("14:30");
    expect(formatTime(t(9, 5), "ru-RU", false)).toBe("09:05");
    expect(formatTime(t(14, 30), "en-US", true)).toMatch(/^2:30\sPM$/);
    expect(formatTime(t(0, 15), "en-US", true)).toMatch(/^12:15\sAM$/);
    expect(timePattern("ru-RU", false)).toBe("HH:MM");
    expect(timePattern("en-US", true)).toBe("HH:MM AM");
  });

  it("locates the segments of a formatted time", () => {
    expect(timeSegments(t(14, 30), "ru-RU", false).map((s) => [s.type, s.start, s.end])).toEqual([
      ["hour", 0, 2],
      ["minute", 3, 5],
    ]);
    expect(timeSegments(t(14, 30), "en-US", true).map((s) => s.type)).toEqual(["hour", "minute", "dayPeriod"]);
  });

  it("reads typed times leniently", () => {
    const cases: [string, string, ReturnType<typeof t>][] = [
      ["14:30", "ru-RU", t(14, 30)],
      ["14.30", "ru-RU", t(14, 30)],
      ["1430", "ru-RU", t(14, 30)],
      ["930", "ru-RU", t(9, 30)],
      ["9", "ru-RU", t(9, 0)],
      [" 9:05 ", "ru-RU", t(9, 5)],
      ["2:30 pm", "en-US", t(14, 30)],
      ["2:30PM", "en-US", t(14, 30)],
      ["2p", "en-US", t(14, 0)],
      ["12 am", "en-US", t(0, 0)],
      ["12:15 PM", "en-US", t(12, 15)],
      ["14:30", "en-US", t(14, 30)],
    ];
    for (const [text, locale, expected] of cases) expect(parseTimeText(text, locale)).toEqual(expected);
  });

  it("refuses what is not a time", () => {
    for (const text of ["", "25:00", "12:60", "13 pm", "0 am", "abc", "1:2", "12345", "9 вечера"]) {
      expect(parseTimeText(text, "en-US")).toBeNull();
    }
  });
});
