---
"cennge-ui": patch
---

`minValue` and `maxValue` of Calendar, RangeCalendar, DatePicker and DateRangePicker accept `null`, meaning no limit. A limit counted from today, which is known only once the page is in the browser, can be passed straight through: `minValue={today}`.
