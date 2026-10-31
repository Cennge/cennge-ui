---
"cennge-ui": minor
---

Charts, in a new entry `cennge-ui/charts` (ESM, like the map), drawn in SVG by cennge-ui itself with no chart library underneath:

- `BarChart`: columns or horizontal bars, grouped or stacked.
- `LineChart` and `AreaChart`: change over time, straight or smooth (never overshooting a value), a missing value breaking the line; areas stacked or not.

Series take an eight-colour palette checked for colour blindness in both themes (`--cennge-chart-1…8`, Tailwind's `chart-1…8`), whose first colour is the accent. Legend, axes and a table of the data render on the server; hover, a tap or the arrow keys read every series at a place, and screen readers get the table.
