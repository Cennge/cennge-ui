# cennge-ui

## 0.1.1

### Patch Changes

- 4b33465: `minValue` and `maxValue` of Calendar, RangeCalendar, DatePicker and DateRangePicker accept `null`, meaning no limit. A limit counted from today, which is known only once the page is in the browser, can be passed straight through: `minValue={today}`.

## 0.1.0

### Minor Changes

- First release: React components on Radix and Tailwind CSS v4, dark-first with a swappable accent.
  Tested in Chromium, Firefox and WebKit, on React 17, 18 and 19, and server-rendered in Next.js.
