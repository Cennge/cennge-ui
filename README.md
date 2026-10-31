<div align="center">

# cennge-ui

**Tactile, dark-first React components on Radix UI and Tailwind CSS v4.**

A regular npm package — `npm update` and every app gets the fix.

[![CI](https://github.com/Cennge/cennge-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/Cennge/cennge-ui/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/cennge-ui?color=fb6c1a&label=npm)](https://www.npmjs.com/package/cennge-ui)
[![License: MIT](https://img.shields.io/badge/license-MIT-fb6c1a.svg)](LICENSE)
![React 17–19](https://img.shields.io/badge/react-17%20%7C%2018%20%7C%2019-2c3038)
![Tailwind CSS v4](https://img.shields.io/badge/tailwind-v4-2c3038)

<img src=".github/assets/preview-dark.png" alt="cennge-ui buttons in the dark theme: seven colours by seven variants" width="860" />

</div>

## Why

- **Dark-first, tactile look.** Depth from layered surfaces, a raised edge on solid buttons, a soft press.
- **Recolour without a rebuild.** Every colour, radius and surface is a `--cennge-*` CSS variable.
  Switch the accent with one attribute: `data-accent="blue"`.
- **Updates instead of copy-paste.** Install once, fix bugs centrally.
- **Accessible by default.** Behaviour and focus management come from Radix primitives.
- **Light on dependencies.** No CSS-in-JS, no animation library: motion is plain CSS and respects `prefers-reduced-motion`.
  Each component is its own chunk, so a page pays only for what it imports (Button alone: ~2 KB gzip).
- **Server Components ready.** `"use client"` ships in the build; helpers stay server-safe.

> **Status:** early development (0.x).
> **66 components.**
> Forms: Form · Button · Input · PasswordInput · OtpInput · Textarea · NumberInput · DatePicker · DateRangePicker · TimeInput · Select · Combobox · MultiSelect · TagsInput · FileUpload · Checkbox · RadioGroup · Switch · Slider · Rating · ToggleGroup.
> Overlays: Dialog · AlertDialog · Command · Drawer · Popover · Dropdown · ContextMenu · HoverCard · Tooltip · Toast.
> Display: Table · Tree · Calendar · RangeCalendar · Card · Badge · Avatar · Indicator · Alert · Progress · CircularProgress · Skeleton · Spinner · EmptyState · Kbd · Snippet · Separator · Timeline · ScrollArea · Prose · Carousel · VirtualList.
> Navigation: NavigationMenu · Sidebar · Tabs · Accordion · Breadcrumbs · Pagination · Stepper.
> Theme: ThemeSwitch, with ThemeScript and useTheme.
> Charts ([`cennge-ui/charts`](#charts-cennge-uicharts)): BarChart · LineChart · AreaChart · DonutChart · Sparkline.
> Maps ([`cennge-ui/map`](#map-cennge-uimap)): Map with markers, popups, routes, GeoJSON, clusters and arcs.

<details>
<summary>Light theme with the blue accent preset</summary>
<br />
<img src=".github/assets/preview-light.png" alt="cennge-ui buttons in the light theme with the blue accent" width="860" />
</details>

## Install

```bash
pnpm add cennge-ui
```

Peer dependencies: `react` and `react-dom` 17, 18 or 19; `tailwindcss` 4. `maplibre-gl` 6, only for
[maps](#map-cennge-uimap).

```css
/* app.css */
@import "tailwindcss";
@import "cennge-ui/styles.css";
```

That is the whole setup. The stylesheet registers the package with Tailwind (`@source`), adds the tokens,
and makes `dark:` class-based.

```tsx
import { Button } from "cennge-ui";

<Button color="primary" variant="shadow" size="lg">
  Download
</Button>;
```

## Theming

- **Dark mode:** `class="dark"` on `<html>`. Set it yourself, or let the package keep it, below.
- **Accent preset:** `data-accent="orange" | "blue" | "green" | "violet" | "red"` on `<html>` or any subtree.
- **Your own colours:** override the `--cennge-*` variables in your CSS, for example:

```css
:root {
  --cennge-primary-50: #eef6ff; /* …through… */
  --cennge-primary-950: #0b1f3a;
  --cennge-primary: #1f6feb;            /* solid fill */
  --cennge-primary-foreground: #ffffff; /* text on the fill */
  --cennge-primary-text: #1a5fd0;       /* the colour as text, light theme */
}
.dark {
  --cennge-primary-text: #6ea8ff;       /* the colour as text, dark theme */
}
```

Radii, surfaces, borders and motion are variables too (`--cennge-radius-medium`, `--cennge-surface-2`…).
See [`src/styles.css`](src/styles.css).

### Light, dark or as the system says

The server cannot know a choice kept in the browser, so the work is split in three, and the page neither
flashes nor reports a hydration mismatch:

```tsx
// app/layout.tsx (Next.js)
import { ThemeScript } from "cennge-ui";

export default function RootLayout({ children }) {
  return (
    // The script sets the class on <html> before React hydrates; this covers that element's attributes only.
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript defaultTheme="dark" />  {/* the stored theme, before the first paint */}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

```tsx
import { ThemeSwitch, useTheme } from "cennge-ui";

<ThemeSwitch defaultTheme="dark" />                    {/* light · dark · system */}

const { theme, resolvedTheme, setTheme } = useTheme({ defaultTheme: "dark" });
```

- `useTheme()` gives `undefined` on the server and while the page hydrates, then the real values: the first
  render matches the server's HTML. Show what depends on the theme with CSS (`dark:hidden`) where you can.
- The choice is kept in `localStorage` (`storageKey`, default `cennge-theme`), follows the system while it is
  "system", and reaches every tab. Pass the same options to ThemeScript, useTheme and ThemeSwitch.
- Without server rendering (Vite), call `initTheme({ defaultTheme: "dark" })` once before the first render
  instead of ThemeScript.

## Button

| prop | values | default |
| --- | --- | --- |
| `color` | `default` `primary` `secondary` `success` `warning` `danger` `info` | `default` |
| `variant` | `solid` `shadow` `bordered` `flat` `faded` `light` `ghost` | `solid` |
| `size` | `sm` `md` `lg` | `md` |
| `radius` | `none` `sm` `md` `lg` `full` | `md` |
| `isIconOnly`, `fullWidth`, `isDisabled`, `isLoading` | boolean | `false` |
| `startContent`, `endContent`, `spinner` | ReactNode | |
| `asChild` | render your own element, e.g. a router `<Link>` | `false` |
| `className` | merged with tailwind-merge, wins over variant classes | |

## Components

```tsx
import {
  Badge, Button, Card, CardBody, CardFooter, CardHeader,
  Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
  Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger,
  Input, Tooltip,
} from "cennge-ui";

// Input — controlled or uncontrolled, with label, helper text, validation and a clear button
<Input label="Email" isRequired isClearable value={email} onValueChange={setEmail}
       isInvalid={!valid} errorMessage="Enter a valid email" />

// Badge — solid, flat, bordered, faded, dot
<Badge color="success" variant="dot">Online</Badge>

// Card — raised, bordered, flat; pressable as a link
<Card asChild isPressable>
  <a href="https://github.com/Cennge/ai-niche-scout">
    <CardHeader>ai-niche-scout</CardHeader>
    <CardBody>Validate an AI startup idea: competitors and 54 AI niches</CardBody>
  </a>
</Card>

// Tooltip — works with or without the provider
<Tooltip content="Star this repository" showArrow>
  <Button isIconOnly aria-label="Star"><StarIcon /></Button>
</Tooltip>

// Dialog — long content scrolls inside DialogBody
<Dialog>
  <DialogTrigger><Button color="danger">Delete</Button></DialogTrigger>
  <DialogContent size="sm">
    <DialogHeader>
      <DialogTitle>Delete project?</DialogTitle>
      <DialogDescription>This cannot be undone.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose><Button variant="flat">Cancel</Button></DialogClose>
      <Button color="danger" onClick={remove}>Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Dropdown
<Dropdown>
  <DropdownTrigger><Button variant="faded">Actions</Button></DropdownTrigger>
  <DropdownContent>
    <DropdownItem shortcut="⌘E" onAction={edit}>Edit</DropdownItem>
    <DropdownSeparator />
    <DropdownItem color="danger" onAction={remove}>Delete</DropdownItem>
  </DropdownContent>
</Dropdown>
```

Inner parts of `Input` and `DialogContent` take classes through `classNames={{ slot: "…" }}`.

### Toasts

Mount `<Toaster />` once, then call `toast()` from anywhere — event handlers, data hooks, plain modules.

```tsx
import { Toaster, toast } from "cennge-ui";

<Toaster placement="bottom-right" />;

toast("Link copied");
toast.success("Deployed", { description: "v0.1.0 is live" });
toast.warning("Branch is behind", { action: { label: "Update", onClick: rebase } });
toast.promise(push(), { loading: "Pushing…", success: "Pushed", error: "Push failed" });
```

> **React 17:** toasts do not show with `radix-ui` 1.8.1. Its Toast 1.3.1 drops its own state updates when
> `React.startTransition` is missing ([radix-ui/primitives#4228](https://github.com/radix-ui/primitives/issues/4228)).
> Once Radix ships the fix, updating `radix-ui` is enough.

### Select, Combobox, MultiSelect

```tsx
import { Combobox, Select, SelectItem } from "cennge-ui";

// Select — a fixed list. `null` means "nothing selected"; isClearable returns to the placeholder.
<Select label="Language" value={lang} onValueChange={setLang} isClearable>
  <SelectItem value="ts">TypeScript</SelectItem>
  <SelectItem value="py">Python</SelectItem>
</Select>

// Combobox — type to filter. Full keyboard support: arrows, Home/End, Enter, Escape.
const repos = [
  { value: "cennge-ui", label: "cennge-ui", description: "React UI library" },
  { value: "ai-niche-scout", label: "ai-niche-scout" },
];
<Combobox label="Repository" items={repos} value={repo} onValueChange={setRepo} isClearable />

// MultiSelect — the same component with selectionMode="multiple": tags, Backspace removes the last one.
<Combobox selectionMode="multiple" label="Topics" items={topics} values={selected} onValuesChange={setSelected} />
```

### More inputs

```tsx
<Textarea label="Release notes" minRows={3} maxRows={8} />          // grows with the text

<RadioGroup label="Visibility" value={visibility} onValueChange={setVisibility}>
  <Radio value="public" description="Anyone on the internet">Public</Radio>
  <Radio value="private">Private</Radio>
</RadioGroup>

<Slider label="Stars" value={range} onValueChange={setRange} min={0} max={1000} />   // [from, to] → "Stars Minimum", "Stars Maximum"
<Slider label="Opacity" defaultValue={70} formatValue={(v) => `${v}%`} />
<Slider label="Coverage" marks={[0, 50, 100].map((v) => ({ value: v, label: `${v}%` }))} />  // a click on a label moves the thumb
<Slider label="Parallel jobs" min={1} max={16} marks={[1, 2, 4, 8, 16]} restrictToMarks />   // stops only on the marks

<Rating label="Rate this repo" value={stars} onValueChange={setStars} />   // 0 = no rating; a second click clears
<Rating label="Docs" allowHalf defaultValue={3.5} />                      // half stars
<Rating isReadOnly value={4.3} aria-label="Average rating" />             // read as "Average rating: 4.3 stars"
```

### Drawer, Popover, Accordion, Progress, Pagination

```tsx
<Drawer>
  <DrawerTrigger><Button>Settings</Button></DrawerTrigger>
  <DrawerContent placement="right" size="md">          {/* left | right | top | bottom */}
    <DrawerHeader><DrawerTitle>Repository settings</DrawerTitle></DrawerHeader>
    <DrawerBody>…</DrawerBody>
  </DrawerContent>
</Drawer>

<Popover>
  <PopoverTrigger><Button>Share</Button></PopoverTrigger>
  <PopoverContent showArrow>…</PopoverContent>
</Popover>

<Accordion variant="splitted" selectionMode="multiple">
  <AccordionItem value="install" title="How do I install it?">pnpm add cennge-ui</AccordionItem>
</Accordion>

<Progress label="Uploading" value={42} />    {/* no value → indeterminate */}
<Pagination total={24} page={page} onPageChange={setPage} />
```

### NumberInput, TagsInput, FileUpload

```tsx
// Locale-aware: "1 234,5 ₽" in, 1234.5 out. Arrows, PageUp/PageDown, Home/End; hold − / + to repeat.
<NumberInput label="Budget" locale="ru-RU" min={0} step={100}
             formatOptions={{ style: "currency", currency: "RUB" }} value={budget} onValueChange={setBudget} />

// Free-typed tags: Enter or comma adds, pasted lists are split, duplicates are refused.
<TagsInput label="Topics" value={topics} onValueChange={setTopics} maxTags={10}
           validate={(tag) => /^[a-z0-9-]+$/.test(tag)} />

// Drag and drop or browse; type, size and count checks with readable reasons; image previews.
<FileUpload label="Screenshots" accept={["image/*", ".pdf"]} maxSize={5 * 1024 * 1024} maxFiles={4}
            value={files} onValueChange={setFiles} onReject={(rejections) => …} />
```

Pass `locale` to `CenngeProvider` once to format numbers and file sizes for your language.

### AlertDialog, Snippet, PasswordInput, OtpInput

```tsx
// AlertDialog: a click outside does not close it, focus starts on Cancel. Return a promise from
// onAction to keep it open with a spinner: it closes on success and stays open for a retry on failure.
<AlertDialog>
  <AlertDialogTrigger><Button color="danger" variant="flat">Delete repository</Button></AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Cennge/ai-niche-scout?</AlertDialogTitle>
      <AlertDialogDescription>Issues, releases and the wiki go with it.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction color="danger" onAction={() => deleteRepository()}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

// Snippet: a copy button; the "$" is never copied. A line break gives one row per command.
<Snippet>pnpm add cennge-ui</Snippet>
<Snippet variant="bordered">{"git clone https://github.com/Cennge/ai-niche-scout.git
cd ai-niche-scout"}</Snippet>

// PasswordInput: show/hide keeps the caret in place, a form submit hides it again, Caps Lock hint.
<PasswordInput label="New password" autoComplete="new-password" description="At least 12 characters" />

// OtpInput: SMS autofill and paste fill every slot, one Tab stop, arrows move between slots.
<OtpInput label="Verification code" groupSize={3} onComplete={verify} />
```

Snippet falls back to a selected textarea where the Clipboard API is missing, e.g. a dev server opened over plain http.

### Dates and times

```tsx
// Values are ISO strings with no time zone: "2026-10-19", "14:30". They survive JSON, FormData and
// server actions, and daylight-saving changes never shift a day.
<DatePicker label="Release" value={date} onValueChange={setDate} minValue="2026-01-01" />

// Typing is lenient: "19.10.2026", "19/10/26" and "19102026" all work in ru-RU. Text that is not a
// date stays in the field, with the reason under it.
<DateRangePicker label="Vacation" value={range} onValueChange={setRange}   // { start, end } | null
                 isDateUnavailable={(date) => holidays.has(date)} />        // a range cannot cross these

// Arrows change the part under the caret: hours, minutes by step, or AM/PM.
<TimeInput label="Call" step={15} minValue="09:00" maxValue="18:00" />

<Calendar value={date} onValueChange={setDate} />                  // month and year pickers jump to any year
<RangeCalendar visibleMonths={2} value={range} onValueChange={setRange} />
```

Names, the first day of the week and the order of a typed date come from `Intl` for the `locale`
(set it once on `CenngeProvider`); there is no date library to ship. Combine a DatePicker and a
TimeInput for a date and time: `` `${date}T${time}` ``.

On a server-rendered page only the browser knows the user's today: the server renders in its own time
zone, a static page on the day it was built. Calendars mark today once hydrated, and one without a value
shows its month then, keeping its size until that moment. Limits counted from today, such as
`minValue`, need the same care: set them after mount, as `playground/DatesDemo.tsx` does; until then
`null` means no limit.

### Table and Tree

```tsx
// Native table markup; sortable headers set aria-sort. Hooks for client-side sorting and selection.
const { sortedRows, getSortProps } = useTableSort(repos, { getValue: (repo, column) => repo[column] });
const selection = useTableSelection(sortedRows.map((repo) => repo.id));

<Table aria-label="Repositories" isHoverable isLoading={isFetching}>
  <TableHeader>
    <TableColumn><Checkbox aria-label="Select all" isSelected={selection.allSelected}
      isIndeterminate={selection.someSelected} onValueChange={selection.toggleAll} /></TableColumn>
    <TableColumn {...getSortProps("name")}>Name</TableColumn>
    <TableColumn {...getSortProps("stars")} align="end">Stars</TableColumn>
  </TableHeader>
  <TableBody emptyContent={<EmptyState title="No repositories" />}>
    {sortedRows.map((repo) => (
      <TableRow key={repo.id} isSelected={selection.isSelected(repo.id)}>…</TableRow>
    ))}
  </TableBody>
</Table>

// TanStack Table: TableColumn takes its sort state and handler as they are.
<TableColumn onSort={header.column.getToggleSortingHandler()} sortDirection={header.column.getIsSorted()}>

// Tree: the WAI-ARIA tree keyboard, type-ahead, and children fetched on first open.
<Tree aria-label="Files" items={files} onAction={(file) => open(file.id)}
      loadChildren={(folder) => fetchFolder(folder.id)} />

// ScrollArea: scrollbars in the theme's colours on every OS. Content that scrolls is a named region
// the keyboard can reach; long lines still end in "…" (truncate works inside, radix-ui#926).
<ScrollArea aria-label="Commits" fadeEdges className="h-64">
  {commits.map((commit) => <p key={commit.sha} className="truncate">{commit.message}</p>)}
</ScrollArea>
<ScrollArea orientation="horizontal">…</ScrollArea>   // also "both"; type="hover" | "scroll" | "auto" | "always"
```

### Carousel

Native scroll snapping, no carousel library: a finger, a trackpad and the keyboard scroll it as usual,
and a mouse can drag it. Follows the WAI-ARIA carousel pattern: slides are named "3 of 8", moves are
announced, autoplay pauses under the mouse, stops when focus comes in, always has a pause button and
never starts on its own with reduced motion.

```tsx
<Carousel aria-label="Releases" autoplay loop className="md:[--carousel-per-view:2]">   {/* responsive with classes */}
  <CarouselContent>
    {releases.map((release) => <CarouselItem key={release.tag}>…</CarouselItem>)}
  </CarouselContent>
  <CarouselControls />                     {/* ‹  ⏸ • • •  › under the slides */}
</Carousel>

<Carousel aria-label="Screenshots" slidesPerView={1.2} align="center">
  <CarouselContent arrows>…</CarouselContent>   {/* arrows over the slides, for images */}
  <CarouselDots />
</Carousel>
```

`useCarousel()` gives custom controls (thumbnails, counters) the index, `scrollTo`, `scrollPrev` and `scrollNext`.

### Prose

Rendered Markdown, MDX or CMS HTML in the theme's colours: headings, lists, links, quotes, code blocks,
tables, task lists and images. Spacing is in `em`, so `size` scales everything.

```tsx
<Prose className="max-w-prose">
  <MDXContent />                       {/* or dangerouslySetInnerHTML={{ __html: html }} */}
</Prose>

<Prose size="sm" asChild><article>…</article></Prose>
```

The styles are the `cennge-prose` class in `cennge-ui/styles.css`, so plain HTML can use it too:
`<article class="cennge-prose">`. They sit in the `components` layer: a utility on any element inside
wins (`<h2 className="text-xl">`), and `not-prose` switches them off for a subtree. Code blocks that
scroll sideways become keyboard-focusable.

### NavigationMenu

Site navigation with dropdown panels, on Radix NavigationMenu. The panel opens under its own trigger
and stays inside the window (radix-ui/primitives#1462), can open on click instead of hover (#1630), and
with `keepMounted` the links of closed panels stay in the HTML for search engines (#1273).

```tsx
<NavigationMenu aria-label="Main" openOn="click">          {/* or "hover"; orientation="vertical" */}
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Components</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="/docs/carousel" title="Carousel" description="Native scroll snapping" />
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink asChild isActive><Link href="/changelog">Changelog</Link></NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

### VirtualList: thousands of rows

```tsx
<VirtualList items={commits} getKey={(c) => c.sha} aria-label="Commits" className="h-96" listRef={list}>
  {(commit) => <CommitRow commit={commit} />}               {/* rows may differ in height */}
</VirtualList>
list.current?.scrollToIndex(4811, { align: "center" });
```

Only the rows in view are in the DOM; each still tells screen readers its place in the whole list, and
rows of any height are measured as they appear. `useVirtualizer` is the same engine for your own markup.
Combobox and MultiSelect switch to it by themselves past 100 options.

### Map (`cennge-ui/map`)

```bash
pnpm add maplibre-gl   # only apps with a map need it
```

```tsx
import { Map, MapControls, MapMarker, MapPopup, MapRoute } from "cennge-ui/map";

<Map aria-label="Offices" defaultBounds={[[-74.02, 40.69], [-73.82, 40.86]]} className="h-96">
  <MapRoute coordinates={route} />                          {/* under the place names, in the accent */}
  <MapControls showLocate showFullscreen />
  <MapMarker lngLat={[-73.9855, 40.758]} label="Manhattan office" tooltip="Manhattan" popup={<OfficeCard />} />
  <MapPopup lngLat={clicked} isOpen={open} onOpenChange={setOpen} label="Chosen point">…</MapPopup>
</Map>
```

Data on the map:

```tsx
import { MapArc, MapClusterLayer, MapGeoJSON, MapLegend } from "cennge-ui/map";

<MapGeoJSON data={regions} valueProperty="downloads" tooltip={(r) => `${r.name}: ${r.downloads}`} />
<MapLegend title="Downloads" domain={[0, 6000]} />          {/* the same shades, low to high */}
<MapArc arcs={[{ from: manhattan, to: queens }]} color="secondary" />
<MapClusterLayer items={stores} getLngLat={(s) => s.lngLat} getLabel={(s) => s.name}
                 onItemClick={open} clusterLabel={(count, shown) => `${shown} stores`} />
```

- MapGeoJSON draws areas, lines and points; with `valueProperty` it shades them along the colour's
  scale (a choropleth), light to dark on a light map and the other way round on a dark one. Hover
  highlights a feature and shows `tooltip`; on a phone a tap does. Give screen readers the same numbers
  another way too, say a table: a drawing on a canvas is not read out.
- MapClusterLayer takes thousands of points. Groups and single points are markers, buttons in the tab
  order; a group zooms in until it comes apart. Only what is in view is in the page.
- maplibre-gl is fetched when the first map mounts; until then, and on the server, the map holds its
  place. The map code itself is 9 to 12 KB gzip.
- The base map is [OpenFreeMap](https://openfreemap.org)'s Positron (no key, no usage limits,
  commercial use allowed) recoloured with the theme's tokens: land in the surfaces, water and parks
  touched with info and success, labels in the text colours. Light or dark with the page. Pass your
  own with `mapStyle` (a URL, a style object, or `{ light, dark }`; `openFreeMapStyles` has OpenFreeMap's
  as published); `blankMapStyle(color)` draws nothing but your data.
- Markers, tooltips and popups are our own components over the map, not MapLibre's: markers with a popup
  or `onClick` are buttons in the tab order, popups are dialogs that close on Escape and pan the map to
  fit. The map itself takes focus too: arrows move it, plus and minus zoom.
- `useMap()` and `onLoad` give the MapLibre map for everything else. The sources' credits stay in the corner,
  as their licences ask.

MapLibre draws in a worker, and bundlers do not find its file by themselves. Tell it once, at startup:

```ts
// Vite
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { setMapWorkerUrl } from "cennge-ui/map";
setMapWorkerUrl(workerUrl);
```

Next.js and other bundlers: copy `maplibre-gl-worker.mjs` and `maplibre-gl-shared.mjs` from
`node_modules/maplibre-gl/dist` to `public/maplibre/` (say, in a `postinstall` script), then call
`setMapWorkerUrl("/maplibre/maplibre-gl-worker.mjs")` in a client component. Unlike maplibre-gl's own
`setWorkerUrl`, ours does not import maplibre-gl, so it still loads only with a map.

### Command palette and Sidebar

```tsx
// ⌘K / Ctrl+K from anywhere. Focus stays in the search; every typed word must match the text or
// keywords, ignoring case and accents. Escape clears the query first, then closes.
<CommandDialog label="Commands">
  <CommandGroup heading="Repositories">
    <CommandItem onAction={() => router.push("/cennge-ui")} keywords={["ui", "components"]}>cennge-ui</CommandItem>
  </CommandGroup>
  <CommandSeparator />
  <CommandGroup heading="Actions">
    <CommandItem onAction={createRepository} shortcut={<Kbd keys="command">N</Kbd>}>New repository</CommandItem>
  </CommandGroup>
</CommandDialog>

// App shell: a column that collapses to icons on desktop, a drawer on phones that closes once a
// page is chosen, also with Next.js Link.
<SidebarLayout>
  <Sidebar label="Repository">
    <SidebarHeader>cennge-ui</SidebarHeader>
    <SidebarNav>
      <SidebarItem asChild isActive={pathname === "/issues"} icon={<IssueIcon />} endContent="12">
        <Link href="/issues">Issues</Link>
      </SidebarItem>
    </SidebarNav>
  </Sidebar>
  <main><SidebarTrigger /> …</main>
</SidebarLayout>
```

### Stepper and Timeline

```tsx
<Stepper activeStep={step} onStepClick={setStep} completedContent={<p>Done</p>}>
  <Step title="Repository" description="Owner and name"><RepoForm /></Step>
  <Step title="Settings"><SettingsForm /></Step>
  <Step title="Review" />
</Stepper>

<Timeline activeIndex={1}>                     {/* omit activeIndex for a plain history */}
  <TimelineItem title="Ordered" time="Mon" />
  <TimelineItem title="Shipped" time="Tue, 14:30" dateTime="2026-10-20T14:30" />
  <TimelineItem title="Delivered" />
</Timeline>
```

### Small building blocks

```tsx
<Kbd keys="command">K</Kbd>                                   {/* ⌘K, read as "Command K" */}
<Separator>or</Separator>

<Breadcrumbs maxItems={3}>                                    {/* middle collapses into "…" */}
  <BreadcrumbItem href="/Cennge">Cennge</BreadcrumbItem>
  <BreadcrumbItem href="/Cennge/cennge-ui">cennge-ui</BreadcrumbItem>
  <BreadcrumbItem>README.md</BreadcrumbItem>                   {/* last = current page */}
</Breadcrumbs>

<ToggleGroup aria-label="View" defaultValue="code">          {/* never ends up empty */}
  <ToggleGroupItem value="code">Code</ToggleGroupItem>
  <ToggleGroupItem value="preview">Preview</ToggleGroupItem>
</ToggleGroup>

<Indicator content={unread} label={`${unread} unread`} isInvisible={unread === 0}>
  <Button isIconOnly aria-label="Notifications"><BellIcon /></Button>
</Indicator>

<CircularProgress label="Test coverage" value={87} showValue />
<EmptyState title="No open issues" actions={<Button>New issue</Button>} />
```

`ContextMenu` and `HoverCard` follow the same pattern as `Dropdown` and `Popover`: a trigger plus content.

### Form: errors from the server, under their fields

```tsx
"use client";
const [state, action, isPending] = useActionState(saveProfile, {});   // a Next.js server action

<Form action={action} validationErrors={state.errors}>                // { email: "Already taken" }
  <Input name="email" label="Email" type="email" isRequired />
  <Select name="plan" label="Plan" isRequired>…</Select>
  <Checkbox name="terms" isRequired>I agree to the terms</Checkbox>
  <Button type="submit" isLoading={isPending}>Save</Button>
</Form>
```

- Each error appears under the field with that `name`, is read with it (`aria-describedby`), and goes
  away as soon as that field is edited. A new set of errors focuses the first one in the form.
- The browser's own checks (`isRequired`, `type="email"`, `minLength`, `pattern`) show the same way
  instead of the browser's tooltips, and a blocked submit focuses the first field to fix.
- Every field joins in: inputs, Select, Combobox, TagsInput, DatePicker, TimeInput, OtpInput, FileUpload,
  RadioGroup, Checkbox, Rating. Your own fields can too, with `useFormField(name)`.
- React 19 resets a form after its action. Pass the submitted values back and use them as
  `defaultValue` (with a `key`) to keep what was typed.

### Forms and feedback

```tsx
<Switch isSelected={on} onValueChange={setOn}>Pull request notifications</Switch>
<Checkbox isIndeterminate={some && !all} isSelected={all} onValueChange={selectAll}>All labels</Checkbox>
<Alert color="danger" title="Build failed" description="Typecheck job exited with code 2" isClosable />

<Tabs defaultValue="code" variant="underlined" color="primary">
  <TabsList aria-label="Repository">
    <TabsTrigger value="code">Code</TabsTrigger>
    <TabsTrigger value="issues">Issues</TabsTrigger>
  </TabsList>
  <TabsContent value="code">…</TabsContent>
  <TabsContent value="issues">…</TabsContent>
</Tabs>

<AvatarGroup max={3}>
  <Avatar src="https://github.com/Cennge.png" name="Cennge" isBordered />
  <Avatar name="Ann Lee" color="primary" isBordered />
</AvatarGroup>

<Skeleton isLoaded={!isLoading} className="h-4 w-40"><p>{user.name}</p></Skeleton>
```

### Charts (`cennge-ui/charts`)

Drawn in SVG by cennge-ui itself, no chart library underneath: 8.4 KB gzip for all of them, 5.2 KB for a
bar chart alone. ESM only, like the map.

```tsx
import { AreaChart, BarChart, DonutChart, LineChart, Sparkline } from "cennge-ui/charts";

<BarChart
  aria-label="Monthly npm downloads"            // names it for screen readers, and its data table
  data={downloads}                              // [{ month: "Jan", cennge: 320, payload: 210 }, …]
  index="month"
  series={[{ key: "cennge", label: "cennge-ui" }, { key: "payload", label: "payload-cache" }]}
/>
<BarChart layout="horizontal" isStacked … />    {/* bars from the side, parts piled up */}
<LineChart curve="smooth" startAtZero={false} … />
<AreaChart isStacked series={[{ key: "passed", color: "success" }, …]} … />
<DonutChart aria-label="Languages" data={languages} index="language" value="bytes" />
<Sparkline aria-label="Downloads over 12 weeks, up by half" data={[40, 42, 39, 51, 72]} />
```

- **Colours.** Series take the chart palette in order, `--cennge-chart-1…8` (Tailwind's `chart-1…8` for
  legends of your own). Its first colour is the accent. The eight are checked, not picked by eye: neighbours
  stay apart for colour-blind readers and each keeps 3:1 on every surface, in both themes and for every
  accent preset. A ninth series is grey, never a new colour. Give `color` a theme colour where it means
  something (`danger` for failures), or any CSS colour.
- **Reading.** Hover, a tap or the arrow keys show every series at a place (a crosshair on lines, the band
  on bars), with a live region for screen readers, who also get the whole data as a table.
- **Server rendering.** The legend, axes, grid and table come from the server; bars and lines are drawn once
  the plot is measured. DonutChart and Sparkline are drawn whole on the server.
- **Size.** The default height (`h-72`) takes in the axes and the legend: set yours with `className`.
  Labels that would overlap on a narrow chart are left out.
- Numbers follow the provider's locale (`valueFormat` and `axisFormat` to change them); a missing value
  (`null`) breaks a line and reads "–" in the table.
- A dot on a line sits in a ring of the colour behind the chart; off a Card, set `--cennge-chart-surface`.

## Provider (optional)

```tsx
import { CenngeProvider } from "cennge-ui";

<CenngeProvider color="primary" radius="lg" reducedMotion="user">
  {children}
</CenngeProvider>;
```

## Server Components

Components are client components (`"use client"` is in the build). Helpers that must run on the
server import from `cennge-ui/utils`:

```ts
import { cn, tv } from "cennge-ui/utils";
```

## Development

```bash
pnpm install
pnpm dev            # playground at http://localhost:5173
pnpm test           # Vitest unit tests
pnpm test:e2e       # Playwright: Chromium, Firefox, WebKit; desktop, Pixel and iPhone profiles
pnpm typecheck
pnpm build          # tsup → dist/
pnpm check:package  # publint + are-the-types-wrong
pnpm check:next     # after build: a Next.js app on the packed package, server-rendered and hydrated
pnpm size           # what typical imports cost after tree shaking (Button alone: ~2 KB gzip)
pnpm changeset      # describe a change for the next release
```

### How components are tested

- **Unit tests (Vitest + Testing Library)** for logic, roles and labels.
- **End-to-end tests (Playwright)** on isolated fixture pages (`playground/fixtures/*`, opened as
  `/fixture.html?name=…`) in all three engines — Chromium, Firefox and WebKit (Safari's engine) — with
  desktop, Pixel 7 and iPhone 17 profiles: real keyboard, mouse, touch, file choosers and drag events.
- **Accessibility:** every fixture runs through axe-core against WCAG 2.2 AA in the dark and the light theme,
  and so does the whole playground.
- **Clean console:** any error or warning in the browser console fails the test.
- **Next.js:** an App Router app, built on the packed package, renders the whole playground on the
  server. Every browser hydrates it from a time zone where it is another day and with a third locale,
  in production and in development, where React also reports mismatched attributes.
- **React 17 and 18:** CI runs the unit tests on each and compiles an app against their types; the
  regular jobs run React 19.

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © Cennge
