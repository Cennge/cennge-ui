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
- **Server Components ready.** `"use client"` ships in the build; helpers stay server-safe.

> **Status:** early development (0.x).
> **35 components.**
> Forms: Button · Input · Textarea · Select · Combobox · MultiSelect · Checkbox · RadioGroup · Switch · Slider · ToggleGroup.
> Overlays: Dialog · Drawer · Popover · Dropdown · ContextMenu · HoverCard · Tooltip · Toast.
> Display: Card · Badge · Avatar · Indicator · Alert · Progress · CircularProgress · Skeleton · Spinner · EmptyState · Kbd · Separator.
> Navigation: Tabs · Accordion · Breadcrumbs · Pagination.

<details>
<summary>Light theme with the blue accent preset</summary>
<br />
<img src=".github/assets/preview-light.png" alt="cennge-ui buttons in the light theme with the blue accent" width="860" />
</details>

## Install

```bash
pnpm add cennge-ui
```

Peer dependencies: `react` and `react-dom` 17, 18 or 19; `tailwindcss` 4.

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

- **Dark mode:** `class="dark"` on `<html>`. Works with `next-themes` (`attribute="class"`).
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

<Slider label="Stars" value={range} onValueChange={setRange} min={0} max={1000} />   // [from, to] → range
<Slider label="Opacity" defaultValue={70} formatValue={(v) => `${v}%`} />
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
pnpm test           # Vitest
pnpm typecheck
pnpm build          # tsup → dist/
pnpm check:package  # publint + are-the-types-wrong
pnpm changeset      # describe a change for the next release
```

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © Cennge
