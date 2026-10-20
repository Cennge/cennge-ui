# cennge-ui

## 0.2.0

### Minor Changes

- 6baf545: New entry `cennge-ui/map`, on MapLibre GL (an optional peer dependency, fetched only when a map mounts):
  
  - `Map`, with a base map in the theme's colours (OpenFreeMap's Positron, recoloured from the tokens; no key), light and dark with the page.
  - `MapMarker` and `MapPopup`: accessible buttons and dialogs in the library's style.
  - `MapControls`: zoom, north, the user's location, full screen.
  - `MapRoute` and `MapArc`: lines and curves in a token's colour, under the place names.
  - `MapGeoJSON` and `MapLegend`: areas, lines and points, or a choropleth along a colour's scale, with hover tooltips.
  - `MapClusterLayer`: thousands of points, grouped; groups and points are buttons.
  
  See the README for the one-line worker setup.

## 0.1.1

### Patch Changes

- 4b33465: `minValue` and `maxValue` of Calendar, RangeCalendar, DatePicker and DateRangePicker accept `null`, meaning no limit. A limit counted from today, which is known only once the page is in the browser, can be passed straight through: `minValue={today}`.

## 0.1.0

### Minor Changes

- First release: React components on Radix and Tailwind CSS v4, dark-first with a swappable accent.
  Tested in Chromium, Firefox and WebKit, on React 17, 18 and 19, and server-rendered in Next.js.
