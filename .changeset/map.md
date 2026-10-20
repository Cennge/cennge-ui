---
"cennge-ui": minor
---

New entry `cennge-ui/map`, on MapLibre GL (an optional peer dependency, fetched only when a map mounts):

- `Map`, with a base map in the theme's colours (OpenFreeMap's Positron, recoloured from the tokens; no key), light and dark with the page.
- `MapMarker` and `MapPopup`: accessible buttons and dialogs in the library's style.
- `MapControls`: zoom, north, the user's location, full screen.
- `MapRoute` and `MapArc`: lines and curves in a token's colour, under the place names.
- `MapGeoJSON` and `MapLegend`: areas, lines and points, or a choropleth along a colour's scale, with hover tooltips.
- `MapClusterLayer`: thousands of points, grouped; groups and points are buttons.

See the README for the one-line worker setup.
