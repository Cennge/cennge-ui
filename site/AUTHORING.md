# Writing a docs page

The site documents cennge-ui with the library itself. Every component page is a field-guide entry: the component
working on a plate, its field marks, then a reading column. Copy the two reference pages before writing a new one:
`app/docs/combobox/page.mdx` and `app/docs/button/page.mdx`, with their examples in `examples/combobox/` and
`examples/button/`.

## Files

- A page is `app/docs/<slug>/page.mdx`. Its slug, title, one-line summary and family are in `lib/nav.ts`: add the page
  there, in its family. The sidebar, search and previous/next links read it.
- Each page starts with `export const metadata = { title: "<Title>" };`.
- Examples live in `examples/<slug>/<name>.tsx`. One file per example: `"use client";` on the first line (the site
  strips it from the code shown), one default-exported function with a PascalCase name, self-contained, importing only
  from `react`, `cennge-ui`, `cennge-ui/charts`, `cennge-ui/map`, for links `next/link`, and on the Table page
  `@tanstack/react-table`. The file is shown to readers as the code to copy, so write it as code you would copy: short, typed, no test ids, no comments that explain
  the docs rather than the code.
- Plate examples are named `plate.tsx`.

## A component page

```mdx
import { Entry, Example, Plate, Props } from "@/components/docs";
import ThingPlate from "@/examples/thing/plate";
import Basic from "@/examples/thing/basic";

export const metadata = { title: "Thing" };

<Entry
  slug="thing"
  lede="One sentence: what it is, in the reader's words."
  plate={<Plate notes={["Two or three true notes on how it behaves", "…"]}><ThingPlate /></Plate>}
  marks={{ pattern: "…", keyboard: [{ keys: "up" }, "Home"], state: <>…</>, extra: [{ term: "…", detail: "…" }] }}
>

## When to use

## Similar

## <An example's title>

<Example file="thing/basic">
  <Basic />
</Example>

## Props

<Props of="ThingProps" />

</Entry>
```

- The plate is the page's hero: the component at full size doing its main job, plus a second state beside it when
  that shows something (multiple selection, an error, a loading state). Its notes are numbered behaviours a reader can
  try right there. Use `<Mark n={1} />` from `@/components/docs` inside a plate example only to point at a spot the
  note talks about.
- Field marks are measured where possible: import line, size, SSR, tests and source come from `generated/facts.json`
  by themselves. You give `pattern` (the WAI-ARIA pattern or native element), `keyboard` (only keys the component
  really handles: read its source and its tests), `state` (controlled/uncontrolled props) and `extra` rows for one or
  two facts a reader checks before choosing it. Kbd named keys: command shift option ctrl alt enter escape tab
  backspace delete space up down left right; anything else is a string ("Home", "PageDown").
- Reading column, in this order: **When to use** (one or two paragraphs), **Similar** (look-alikes in the library,
  linked, and how to tell them apart), two to five example sections (a `##` title naming what it shows, one or two
  sentences, the `<Example>`), then any of **Accessibility**, **Server rendering**, **Styling** (`classNames` slots)
  when there is something true and specific to say, and **Props** last: one `<Props of="…Props" />` per part a
  reader configures, each under a `###` with the part's name when there are several.
- `<Props>` reads the generated table of the library's exported `...Props` types (`generated/props.json`); the names
  must exist there.

## A guide

```mdx
import { Guide } from "@/components/docs";

export const metadata = { title: "Installation" };

<Guide slug="installation">

## …

</Guide>
```

Fenced code blocks (```tsx, ```bash, ```css, ```json) are highlighted at build time and get a copy button.

## Content

- Every statement must be true of the code in `src/`. Read the component's source, its unit tests
  (`src/components/<name>/*.test.tsx`), its e2e spec (`e2e/<name>.spec.ts`), its playground fixture
  (`playground/fixtures/<name>.tsx`), its README section and `DECISIONS.md` before writing. If you cannot point to the
  line that makes a sentence true, cut the sentence.
- Never invent: no customers, quotes, benchmarks, download counts, browser support beyond what the tests run
  (Chromium, Firefox, WebKit; desktop and phone viewports), or features the component lacks.
- Example data: the owner's repositories (cennge-ui, ai-niche-scout, payload-cache, spredo-crypto-screener,
  playwright-msi-scraper), npm releases, deploys, CI runs, issues. Email addresses use `dev@example.com`. Maps are set
  in New York. No lorem ipsum, no "Item 1".
- English, plain and short. Sentence-case headings. Address the reader as "you" only when it helps. No "simply",
  "just", "easy", "powerful", "seamless", no exclamation marks, no emoji.

## Look

- Examples sit in a flex-wrap preview area on surface-2 with padding: size fields yourself (`w-full max-w-80`), let
  buttons be their natural size, keep overlays' triggers in the preview.
- Use the library's tokens and utilities only (`bg-surface-3`, `text-muted`, `text-primary-text`, `rounded-large`).
  No new colours, no gradients, no shadows on things at rest.
- Pages must read well in dark and light themes and with every accent, at 1440, 768 and 390 pixels wide.

## Checking a page

1. `node site/scripts/check-mdx.mjs site/app/docs/<slug>/page.mdx` (from the repository root): the MDX compiles.
2. `cd site && pnpm typecheck`: the examples type-check against the built library (`pnpm build` at the root first
   when the library changed).
3. `cd site && pnpm dev` serves the site at http://localhost:3150. Look at your page in both themes and at 1440,
   768 and 390 pixels, or take screenshots of it:
   `BASE=http://localhost:3150 OUT=<folder> THEMES=dark,light node site/scripts/shots.mjs /docs/<slug>/`.
   Try the interactions the page describes.
4. `cd site && pnpm build && pnpm test:e2e`: every page renders, passes axe in both themes and links to pages that
   exist.
5. Pages and examples live in `app/docs/` and `examples/`. A change to the shell (`lib/`, `components/`,
   `app/globals.css`) touches every page: check a few others too.
