"use client";

import { useState, type FormEvent } from "react";
import {
  Badge,
  Button,
  Combobox,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Textarea,
  toast,
} from "cennge-ui";

const branches = [
  "main",
  "feat/charts",
  "feat/bar-chart",
  "feat/line-chart",
  "feat/donut-chart",
  "feat/sparkline",
  "feat/theme-switch",
  "feat/map",
  "feat/map-clusters",
  "fix/dialog-backdrop",
  "fix/dialog-popup-scroll",
  "fix/select-chevron",
  "fix/button-cursor",
  "fix/kbd-symbols",
  "fix/carousel-controls",
  "fix/virtual-list-home-end",
  "test/next-time-zones",
  "ci/firefox-xvfb",
  "docs/new-york-maps",
].map((branch) => ({ value: branch, label: branch }));

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

interface Release {
  title: string;
  target: string;
  notes: string;
}

function EditRelease({ release, onSave }: { release: Release; onSave: (release: Release) => void }) {
  const [isOpen, setOpen] = useState(false);
  const [draft, setDraft] = useState(release);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(draft);
    setOpen(false);
    toast.success("Draft saved", { description: `cennge-ui 0.3.2 targets ${draft.target}` });
  }

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(next) => {
        if (next) setDraft(release);
        setOpen(next);
      }}
    >
      <DialogTrigger>
        <Button color="primary">Edit release</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={save} className="contents">
          <DialogHeader>
            <DialogTitle>Edit release</DialogTitle>
            <DialogDescription>cennge-ui 0.3.2 stays a draft until you publish it.</DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <Input label="Title" value={draft.title} onValueChange={(title) => setDraft({ ...draft, title })} />
            <Combobox
              label="Target branch"
              items={branches}
              value={draft.target}
              onValueChange={(target) => setDraft({ ...draft, target: target ?? "main" })}
            />
            <Textarea label="Notes" value={draft.notes} onValueChange={(notes) => setDraft({ ...draft, notes })} />
          </DialogBody>
          <DialogFooter>
            <DialogClose>
              <Button variant="flat">Cancel</Button>
            </DialogClose>
            <Button type="submit" color="primary">
              Save draft
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Changelog() {
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

export default function DialogPlate() {
  const [release, setRelease] = useState<Release>({
    title: "Dates in UTC",
    target: "main",
    notes: "The playground reads the repositories' update dates in UTC, and the Next.js check looks from both sides of the server's time zone.",
  });

  return (
    <div className="w-full max-w-md rounded-large bg-surface-3 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">cennge-ui 0.3.2</span>
        <Badge size="sm" variant="flat" color="warning">
          Draft
        </Badge>
      </div>
      <p className="mt-3 text-[15px] font-medium">{release.title}</p>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{release.notes}</p>
      <p className="mt-3 text-sm text-muted">
        Targets <code className="rounded-small bg-surface-4 px-1.5 py-0.5 font-mono text-[12.5px] text-foreground">{release.target}</code>
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <EditRelease release={release} onSave={setRelease} />
        <Changelog />
      </div>
    </div>
  );
}
