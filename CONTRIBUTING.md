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

## Tests for a new component

1. Unit tests next to the component: `src/components/<name>/<name>.test.tsx`.
2. A fixture page: `playground/fixtures/<name>.tsx`, a default-exported component that renders the
   component in the states worth testing. It opens at `/fixture.html?name=<name>`.
3. An end-to-end spec: `e2e/<name>.spec.ts`. Import `test`, `openFixture` and `expectAccessible` from
   `./test` (not from `@playwright/test`): it fails on console errors. Cover keyboard, pointer and touch,
   and call `expectAccessible` in both themes.

## Before a pull request

```bash
pnpm typecheck
pnpm test
pnpm test:e2e    # first run: pnpm exec playwright install chromium
pnpm build && pnpm check:package
pnpm changeset   # if the change affects the published package
```
