# Contributing

Thanks for helping. A few rules keep the library consistent.

## Setup

```bash
pnpm install
pnpm dev     # playground at http://localhost:5173
```

## Principles

- **Colours only through tokens.** No hex values in components: use `bg-primary`, `text-primary-text`,
  `bg-surface-2` and other utilities from `src/styles.css`.
- **Literal class strings.** Tailwind finds classes by scanning the shipped files, so never build them
  dynamically (`bg-${color}`). Write every variant out, as in `button.styles.ts`.
- **No Radix types in the public API.** Props are our own types from `src/types.ts`.
- **React 17+ compatible.** Do not call `useId`, `useTransition`, `useSyncExternalStore` or React 19 APIs directly.
- **Motion:** animate only `transform` and `opacity`, and respect `prefers-reduced-motion`.
- **Accessibility:** keyboard, focus ring and screen-reader names work before a component is merged.

## Before a pull request

```bash
pnpm typecheck
pnpm test
pnpm build && pnpm check:package
pnpm changeset   # if the change affects the published package
```
