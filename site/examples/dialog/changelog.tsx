"use client";

import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "cennge-ui";

const releases = [
  { version: "0.3.1", date: "1 November 2026", changes: ["The README's map examples are set in New York."] },
  {
    version: "0.3.0",
    date: "31 October 2026",
    changes: [
      "Charts, in a new entry cennge-ui/charts, drawn in SVG with no chart library underneath: BarChart, LineChart, AreaChart, DonutChart and Sparkline.",
      "Series take an eight-colour palette checked for colour blindness in both themes, whose first colour is the accent.",
      "Theme switching without a flash and without a hydration error: ThemeScript, useTheme and ThemeSwitch.",
      "Button shows the pointer cursor, and a loading one the wait cursor, without hover or press effects while it loads.",
      "NavigationMenu triggers and Carousel dots show the pointer cursor.",
      "A popup in a portal opened from a Dialog, Drawer, AlertDialog or CommandDialog scrolls again, also when it is another library's.",
      "Kbd draws its key symbols at the size of the key cap, the same in every font.",
      "A Select inside an open Dialog, Popover or Accordion item no longer shows its chevron turned up while its list is closed.",
    ],
  },
  {
    version: "0.2.0",
    date: "21 October 2026",
    changes: [
      "New entry cennge-ui/map, on MapLibre GL, fetched only when a map mounts.",
      "Map, with a base map in the theme's colours, light and dark with the page.",
      "MapMarker and MapPopup: accessible buttons and dialogs in the library's style.",
      "MapControls: zoom, north, the user's location, full screen.",
      "MapRoute and MapArc: lines and curves in a token's colour, under the place names.",
      "MapGeoJSON and MapLegend: areas, lines and points, or a choropleth along a colour's scale.",
      "MapClusterLayer: thousands of points, grouped; groups and points are buttons.",
    ],
  },
  {
    version: "0.1.1",
    date: "20 October 2026",
    changes: ["minValue and maxValue of Calendar, RangeCalendar, DatePicker and DateRangePicker accept null, meaning no limit."],
  },
  {
    version: "0.1.0",
    date: "19 October 2026",
    changes: ["First release: React components on Radix and Tailwind CSS v4, dark-first with a swappable accent."],
  },
];

export default function ChangelogDialog() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="flat">Changelog</Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Changelog</DialogTitle>
          <DialogDescription>Every release of cennge-ui, newest first.</DialogDescription>
        </DialogHeader>
        {/* Nothing inside takes focus: tabIndex lets the keyboard scroll the body. */}
        <DialogBody
          tabIndex={0}
          className="flex flex-col gap-5 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring"
        >
          {releases.map((release) => (
            <section key={release.version}>
              <h3 className="font-semibold">
                {release.version} <span className="font-normal text-muted">· {release.date}</span>
              </h3>
              <ul className="mt-1.5 flex list-disc flex-col gap-1.5 pl-5">
                {release.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </section>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose>
            <Button variant="flat">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
