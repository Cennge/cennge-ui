# cennge-ui

## 0.5.0

### Minor Changes

- 18923ec: `BottomBar`: a bar at the bottom of the screen for a screen's main action, standing on a fixed BottomNavigation and writing its height to `--cennge-bottom-bar`.
- 7a959a1: `BottomNavigation`: the three to five places of a phone app in a bar at the bottom, an icon over a label each, with counts and dots read by screen readers. Fixed, it pads for the home indicator and writes its height to `--cennge-bottom-nav`; bottom toasts now sit above it.
- 5285b2e: Drawer: a bottom sheet can rest at heights (`snapPoints`), its handle a button that steps through them by click or arrow keys; drag the handle to move between them or down to close. `DropdownContent` takes `onCloseAutoFocus`.
- 5044403: `FloatingActionButton`: the one action of a screen, floating above the bottom bars and clear of the screen's corners; its label folds in and out with `isExtended`.
- dc1433e: `SwipeActions`: a list row with actions behind it, revealed by a swipe on a phone, run by a full swipe, and always listed in a menu at the end of the row for a mouse, a keyboard or a screen reader.

## 0.4.2

### Patch Changes

- 9219b26: Accordion: a focus ring on a field inside an open item shows whole; the clip for the open and close animation cut it at the sides.

## 0.4.1

### Patch Changes

- 90f9cfa: Charts: the hidden data table's caption, the chart's name, no longer shows over the chart. A table's clipping does not reach its caption; the table now sits in a hidden wrapper.

## 0.4.0

### Minor Changes

- 9947f8e: Charts: `references` on BarChart, LineChart and AreaChart draw a dashed goal line or a shaded band; LineChart series take `display: "dots"` for raw readings, and `movingAverage` gives a trend through them. `ChartLabels` gains the words for them.
- 45b56dd: `ProgressRing`: progress towards a goal as a ring, or one ring per goal nested. Past the goal a ring goes round again over its start, with a shadow where it overlaps. Each ring is a meter for screen readers, its words in `labels`. `ChartColor` is now exported from `cennge-ui` too, and the provider's `reducedMotion="always"` cuts animation delays as well as durations.
- eefb5ab: `RangeMeter`: an amount against a floor (`low`), a ceiling (`high`) or both, its status written out ("38 g to go", "In range", "640 kcal left", "136 kcal over") and the part past the ceiling striped.
- e28c778: `StatTile`: one number with its unit and its change, coloured by `goodDirection` so a falling weight can be good news, with room for a chart under it.

## 0.3.1

### Patch Changes

- 20668ec: The README's map examples are set in New York.

## 0.3.0

### Minor Changes

- db78740: Charts, in a new entry `cennge-ui/charts` (ESM, like the map), drawn in SVG by cennge-ui itself with no chart library underneath:
  
  - `BarChart`: columns or horizontal bars, grouped or stacked.
  - `LineChart` and `AreaChart`: change over time, straight or smooth (never overshooting a value), a missing value breaking the line; areas stacked or not.
  - `DonutChart`: a whole and its parts, as a ring with the total in the middle or as a pie, the legend giving each part's value and share. Rendered whole on the server.
  - `Sparkline`: a trend at a glance beside the number it belongs to, a named picture with the latest value as a dot.
  
  Series take an eight-colour palette checked for colour blindness in both themes (`--cennge-chart-1…8`, Tailwind's `chart-1…8`), whose first colour is the accent. Legend, axes and a table of the data render on the server; hover, a tap or the arrow keys read every series at a place, and screen readers get the table.
- 32b28a0: Theme switching without a flash and without a hydration error. `ThemeScript`, in the page's `<head>`, shows the stored theme before the first paint and follows the system and other tabs. `useTheme()` gives `theme`, `resolvedTheme` and `setTheme`, undefined until the page has hydrated, so the first render matches the server's HTML. `ThemeSwitch` is a light / dark / system control on top of it. In an app without server rendering, `initTheme()` does ThemeScript's job.

### Patch Changes

- d948c07: Button shows the pointer cursor, and a loading one the wait cursor, without hover or press effects while it loads. A disabled or loading Button with `asChild` (a link) no longer navigates, on a click or on Enter. Disabled Pagination buttons are dimmed and ignore the pointer.
- 170126b: NavigationMenu triggers and Carousel dots show the pointer cursor.
- 63baf9e: A popup in a portal opened from a Dialog, Drawer, AlertDialog or CommandDialog scrolls again, also when it is another library's (Radix #1159): the dialog's content now sits inside its overlay. The backdrop is the overlay's `::before`, so a backdrop of your own in `classNames.overlay` takes the `before:` variant, e.g. `before:bg-black/70`.
- 055d5ef: Kbd draws its key symbols (⌘ ⇧ ⌥ ↵ ⇥ ⌫ ⌦ and the arrows) at the size of the key cap, the same in every font, instead of as text that came out about 5px tall. Screen readers read a shortcut as "Command Shift K".
- e067d76: A Select inside an open Dialog, Popover or Accordion item no longer shows its chevron turned up while its list is closed.

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
