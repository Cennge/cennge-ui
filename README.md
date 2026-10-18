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

> **Status:** early development (0.x). Available now: `Button`, `CenngeProvider`, `cn`.
> Next up: Input, Card, Dialog, Dropdown, Badge, Tooltip.

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
