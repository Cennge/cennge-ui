/** Every page of the docs, in reading order. The sidebar, search, and previous/next links all read this list. */
export interface NavPage {
  /** URL path segment after /docs/. */
  slug: string;
  title: string;
  /** One line: what it is for. Shown in search and as the page's lede when the page has none. */
  summary: string;
  /** Other words people search for. */
  keywords?: string[];
  /** What a component page imports (its field marks: import line, size). Default: the title, on component pages. */
  imports?: string[];
}
export interface NavFamily {
  title: string;
  /** What the family has in common, said once (chapter openers, the index page). */
  summary: string;
  pages: NavPage[];
}

export const nav: NavFamily[] = [
  {
    title: "Getting started",
    summary: "Install the package, wire up Tailwind, choose a theme and an accent.",
    pages: [
      { slug: "introduction", title: "Introduction", summary: "What cennge-ui is, and why it is a package you update rather than code you copy." },
      { slug: "installation", title: "Installation", summary: "npm install and two CSS imports; the stylesheet registers itself with Tailwind.", keywords: ["setup", "tailwind", "vite", "next"] },
      { slug: "theming", title: "Theming", summary: "Tokens, surfaces, colour roles, the accent presets and your own colours.", keywords: ["tokens", "css variables", "accent", "colors"] },
      { slug: "dark-mode", title: "Dark mode", summary: "ThemeScript, useTheme and ThemeSwitch: the stored theme before the first paint.", keywords: ["theme", "ThemeScript", "useTheme", "ThemeSwitch", "light", "system"] },
      { slug: "server-rendering", title: "Next.js and SSR", summary: "Server Components, hydration without warnings, and what renders on the server.", keywords: ["next.js", "rsc", "hydration", "app router"] },
      { slug: "forms", title: "Forms", summary: "Controlled and uncontrolled fields, server errors under their fields, react-hook-form.", keywords: ["Form", "validation", "server action", "react-hook-form"] },
      { slug: "provider", title: "Provider", summary: "CenngeProvider: default size, radius and colour, locale, reduced motion.", keywords: ["CenngeProvider", "defaults", "locale"] },
    ],
  },
  {
    title: "Actions",
    summary: "Buttons and grouped toggles.",
    pages: [
      { slug: "button", title: "Button", summary: "Seven colours, seven variants, loading and icon-only, links through asChild." },
      { slug: "toggle-group", title: "ToggleGroup", summary: "A row of toggles: one at a time or several.", keywords: ["segmented control", "toggle"], imports: ["ToggleGroup","ToggleGroupItem"] },
    ],
  },
  {
    title: "Inputs",
    summary: "Fields that work controlled and uncontrolled, inside <Form> and with react-hook-form.",
    pages: [
      { slug: "input", title: "Input", summary: "Text field with label, description, error, clear button and adornments.", keywords: ["text field"] },
      { slug: "textarea", title: "Textarea", summary: "Multi-line text that grows with its content.", keywords: ["autosize"] },
      { slug: "number-input", title: "NumberInput", summary: "Numbers with steppers, bounds, keyboard and locale formatting.", keywords: ["stepper", "spinbutton"] },
      { slug: "password-input", title: "PasswordInput", summary: "Password field with a show/hide toggle." },
      { slug: "otp-input", title: "OtpInput", summary: "One-time codes, a box per character, paste-friendly.", keywords: ["pin", "verification code"] },
      { slug: "select", title: "Select", summary: "Pick one from a fixed list; clearable back to the placeholder.", keywords: ["dropdown", "picker"], imports: ["Select","SelectItem"] },
      { slug: "combobox", title: "Combobox", summary: "Type to filter, pick one or many; virtualizes long lists.", keywords: ["autocomplete", "multiselect", "MultiSelect", "typeahead"] },
      { slug: "tags-input", title: "TagsInput", summary: "Free text turned into tags with Enter.", keywords: ["chips", "tokens"] },
      { slug: "checkbox", title: "Checkbox", summary: "On, off and indeterminate.", keywords: ["check"] },
      { slug: "radio", title: "Radio", summary: "One choice from a group.", keywords: ["RadioGroup"], imports: ["RadioGroup","Radio"] },
      { slug: "switch", title: "Switch", summary: "An instant on/off setting.", keywords: ["toggle"] },
      { slug: "slider", title: "Slider", summary: "A value or a range on a track.", keywords: ["range"] },
      { slug: "rating", title: "Rating", summary: "Stars, halves included, readable and editable.", keywords: ["stars", "review"] },
      { slug: "file-upload", title: "FileUpload", summary: "Drop zone and file list with type and size limits.", keywords: ["dropzone", "upload"] },
      { slug: "form", title: "Form", summary: "Errors from the server delivered to fields by name.", keywords: ["validation", "server action"] },
    ],
  },
  {
    title: "Dates and times",
    summary: "ISO strings in and out, Intl for names and order, no date library.",
    pages: [
      { slug: "calendar", title: "Calendar", summary: "A month grid for one date or a range, with year and month pickers.", keywords: ["RangeCalendar"], imports: ["Calendar","RangeCalendar"] },
      { slug: "date-picker", title: "DatePicker", summary: "A typed date with a calendar popover.", keywords: ["date input"] },
      { slug: "date-range-picker", title: "DateRangePicker", summary: "Two dates, typed or picked in one calendar.", keywords: ["range"] },
      { slug: "time-input", title: "TimeInput", summary: "Hours and minutes in the locale's own format.", keywords: ["time"] },
    ],
  },
  {
    title: "Overlays",
    summary: "Nested in each other, opened by touch and by keyboard, tested in every engine.",
    pages: [
      { slug: "dialog", title: "Dialog", summary: "A modal with header, scrolling body and footer.", keywords: ["modal"], imports: ["Dialog","DialogTrigger","DialogContent","DialogHeader","DialogTitle","DialogBody","DialogFooter"] },
      { slug: "alert-dialog", title: "AlertDialog", summary: "A confirmation that needs an answer.", keywords: ["confirm"], imports: ["AlertDialog","AlertDialogTrigger","AlertDialogContent","AlertDialogAction","AlertDialogCancel"] },
      { slug: "drawer", title: "Drawer", summary: "A panel from any edge of the screen.", keywords: ["sheet", "side panel"], imports: ["Drawer","DrawerTrigger","DrawerContent","DrawerHeader","DrawerTitle","DrawerBody"] },
      { slug: "popover", title: "Popover", summary: "Rich content anchored to a trigger.", imports: ["Popover","PopoverTrigger","PopoverContent"] },
      { slug: "tooltip", title: "Tooltip", summary: "A short label on hover and on keyboard focus.", keywords: ["hint"] },
      { slug: "hover-card", title: "HoverCard", summary: "A preview card for links.", imports: ["HoverCard","HoverCardTrigger","HoverCardContent"] },
      { slug: "dropdown", title: "Dropdown", summary: "A menu of actions from a button.", keywords: ["menu", "DropdownMenu"], imports: ["Dropdown","DropdownTrigger","DropdownContent","DropdownItem"] },
      { slug: "context-menu", title: "ContextMenu", summary: "A menu on right click and long press.", keywords: ["right click"], imports: ["ContextMenu","ContextMenuTrigger","ContextMenuContent","ContextMenuItem"] },
      { slug: "command", title: "Command", summary: "A ⌘K palette: search across actions and pages.", keywords: ["command palette", "CommandDialog", "cmdk"], imports: ["CommandDialog","CommandGroup","CommandItem"] },
      { slug: "toast", title: "Toast", summary: "Notifications from anywhere with toast().", keywords: ["Toaster", "notification", "snackbar"], imports: ["Toaster","toast"] },
    ],
  },
  {
    title: "Navigation",
    summary: "Getting around an app: menus, sidebars, steps and pages.",
    pages: [
      { slug: "navigation-menu", title: "NavigationMenu", summary: "Site navigation with panels that stay in view.", keywords: ["menu bar", "mega menu"], imports: ["NavigationMenu","NavigationMenuList","NavigationMenuItem","NavigationMenuTrigger","NavigationMenuContent","NavigationMenuLink"] },
      { slug: "sidebar", title: "Sidebar", summary: "An app sidebar that becomes a drawer on phones.", imports: ["SidebarLayout","Sidebar","SidebarNav","SidebarItem","SidebarTrigger"] },
      { slug: "tabs", title: "Tabs", summary: "Panels behind a row of tabs.", imports: ["Tabs","TabsList","TabsTrigger","TabsContent"] },
      { slug: "breadcrumbs", title: "Breadcrumbs", summary: "Where the page sits in the hierarchy.", imports: ["Breadcrumbs","BreadcrumbItem"] },
      { slug: "pagination", title: "Pagination", summary: "Page numbers with previous and next." },
      { slug: "stepper", title: "Stepper", summary: "Progress through numbered steps.", keywords: ["wizard", "steps"], imports: ["Stepper","Step"] },
    ],
  },
  {
    title: "Mobile",
    summary: "The shell of an app on a phone: bars at the bottom, a floating action, rows that swipe.",
    pages: [
      { slug: "bottom-navigation", title: "BottomNavigation", summary: "Three to five places of an app, in a bar at the bottom.", keywords: ["tab bar", "bottom tabs", "mobile"], imports: ["BottomNavigation","BottomNavigationItem"] },
      { slug: "bottom-bar", title: "BottomBar", summary: "The action a screen is for, pinned in reach of a thumb.", keywords: ["action bar", "sticky footer", "mobile"] },
      { slug: "floating-action-button", title: "FloatingActionButton", summary: "The one action a screen is about, floating at the bottom right.", keywords: ["FAB", "mobile"], imports: ["FloatingActionButton"] },
      { slug: "swipe-actions", title: "SwipeActions", summary: "A list row with actions behind it: swipe, or use its menu.", keywords: ["swipe to delete", "row actions", "mobile"] },
    ],
  },
  {
    title: "Data display",
    summary: "Tables, trees, long lists and the small pieces inside them.",
    pages: [
      { slug: "table", title: "Table", summary: "Native table markup with sorting and selection; TanStack Table plugs in.", keywords: ["data grid", "tanstack"], imports: ["Table","TableHeader","TableColumn","TableBody","TableRow","TableCell"] },
      { slug: "tree", title: "Tree", summary: "A nested list with the WAI-ARIA tree keyboard.", keywords: ["tree view", "file tree"] },
      { slug: "virtual-list", title: "VirtualList", summary: "Thousands of rows, only the visible ones rendered.", keywords: ["virtualization", "windowing"] },
      { slug: "timeline", title: "Timeline", summary: "Events in order with time and status.", imports: ["Timeline","TimelineItem"] },
      { slug: "avatar", title: "Avatar", summary: "A picture or initials, alone or in a group.", keywords: ["AvatarGroup"], imports: ["Avatar","AvatarGroup"] },
      { slug: "stat-tile", title: "StatTile", summary: "One number that matters, and how it moved.", keywords: ["KPI", "metric", "stat card", "delta"] },
      { slug: "badge", title: "Badge", summary: "A short status or count.", keywords: ["chip", "tag", "label"] },
      { slug: "kbd", title: "Kbd", summary: "Keyboard keys and shortcuts, read out by screen readers.", keywords: ["keyboard", "shortcut"] },
      { slug: "snippet", title: "Snippet", summary: "A command with a copy button.", keywords: ["copy", "code"] },
      { slug: "carousel", title: "Carousel", summary: "Slides on native scroll snapping.", keywords: ["slider", "gallery"], imports: ["Carousel","CarouselContent","CarouselItem","CarouselControls"] },
      { slug: "prose", title: "Prose", summary: "Styled Markdown and MDX content.", keywords: ["typography", "markdown", "mdx"] },
    ],
  },
  {
    title: "Feedback",
    summary: "Status, progress and the moments before content arrives.",
    pages: [
      { slug: "alert", title: "Alert", summary: "A message in the flow of the page.", keywords: ["callout", "banner"] },
      { slug: "progress", title: "Progress", summary: "Linear and circular progress, determinate or not.", keywords: ["CircularProgress", "loading"], imports: ["Progress","CircularProgress"] },
      { slug: "progress-ring", title: "ProgressRing", summary: "Goals as rings, one or nested, that lap past the goal.", keywords: ["activity rings", "goal", "meter", "tracker"] },
      { slug: "range-meter", title: "RangeMeter", summary: "An amount against a floor, a ceiling or a range, its status in words.", keywords: ["meter", "budget", "target", "limit", "tracker"] },
      { slug: "spinner", title: "Spinner", summary: "Something is working." },
      { slug: "skeleton", title: "Skeleton", summary: "Placeholders in the shape of what is loading.", keywords: ["loading", "shimmer"] },
      { slug: "empty-state", title: "EmptyState", summary: "What to show, and what to do, when there is nothing yet." },
      { slug: "indicator", title: "Indicator", summary: "A dot or a count on a corner of anything.", keywords: ["notification badge", "dot"] },
    ],
  },
  {
    title: "Layout",
    summary: "Surfaces and structure.",
    pages: [
      { slug: "card", title: "Card", summary: "A raised surface with header, body and footer.", imports: ["Card","CardHeader","CardBody","CardFooter"] },
      { slug: "accordion", title: "Accordion", summary: "Sections that open and close.", keywords: ["collapse", "disclosure"], imports: ["Accordion","AccordionItem"] },
      { slug: "scroll-area", title: "ScrollArea", summary: "Scrolling with themed scrollbars and fades.", keywords: ["scrollbar"] },
      { slug: "separator", title: "Separator", summary: "A divider between groups." },
    ],
  },
  {
    title: "Charts",
    summary: "cennge-ui/charts: own SVG, no chart library, palette checked for colour blindness.",
    pages: [
      { slug: "charts", title: "Charts overview", summary: "The charts entry: palette, tooltips, keyboard, tables for screen readers.", keywords: ["dataviz", "graph"], imports: [] },
      { slug: "bar-chart", title: "BarChart", summary: "Grouped or stacked bars, vertical or horizontal.", keywords: ["column chart"] },
      { slug: "line-chart", title: "LineChart", summary: "Series over time, with a crosshair tooltip.", keywords: ["line graph"] },
      { slug: "area-chart", title: "AreaChart", summary: "Lines with a wash below, stacked or not.", imports: ["AreaChart"] },
      { slug: "donut-chart", title: "DonutChart", summary: "Parts of a whole as a ring or a pie.", keywords: ["pie chart"] },
      { slug: "sparkline", title: "Sparkline", summary: "A trend in a line of text or a stat card." },
    ],
  },
  {
    title: "Map",
    summary: "cennge-ui/map: MapLibre, loaded only when a map mounts, themed by your tokens.",
    pages: [
      { slug: "map", title: "Map", summary: "The map, its controls, and the theme-coloured base map.", keywords: ["maplibre", "openfreemap"], imports: ["Map","MapControls"] },
      { slug: "map-markers", title: "Markers and popups", summary: "React markers, tooltips and popups over the canvas.", keywords: ["MapMarker", "MapPopup"], imports: ["MapMarker","MapPopup"] },
      { slug: "map-routes", title: "Routes and arcs", summary: "Lines between places: routes, dashed paths, arcs.", keywords: ["MapRoute", "MapArc"], imports: ["MapRoute","MapArc"] },
      { slug: "map-data", title: "Data layers", summary: "Choropleths, clusters and a legend from GeoJSON.", keywords: ["MapGeoJSON", "MapClusterLayer", "MapLegend", "choropleth"], imports: ["MapGeoJSON","MapClusterLayer","MapLegend"] },
    ],
  },
];

export const pages = nav.flatMap((family) => family.pages.map((page) => ({ ...page, family: family.title })));

export function pageBySlug(slug: string) {
  const index = pages.findIndex((page) => page.slug === slug);
  if (index < 0) throw new Error(`No docs page "${slug}" in lib/nav.ts`);
  return { page: pages[index]!, previous: pages[index - 1], next: pages[index + 1] };
}
