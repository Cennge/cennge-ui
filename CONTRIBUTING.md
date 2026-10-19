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
- **Server rendering.** Nothing from the clock, `Math.random`, `window` or the default locale while rendering:
  the server's answer differs from the browser's. What only the browser knows waits for `useIsHydrated`
  (`src/utils/use-is-hydrated.ts`). `pnpm check:next` hydrates the playground from another day and locale.
- **Motion:** animate only `transform` and `opacity`, and respect `prefers-reduced-motion`.
- **Accessibility:** keyboard, focus ring and screen-reader names work before a component is merged.
- **Focus rings:** write `outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring`.
  In Tailwind v4 `outline-none` sets `--tw-outline-style: none`, and `outline-2` alone inherits it: no ring.
  `e2e/focus-ring.spec.ts` tabs through every fixture and the playground and fails on an invisible focus.

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
pnpm test:e2e    # first run: pnpm exec playwright install chromium firefox webkit
                 # one engine: pnpm test:e2e --project=firefox
pnpm build && pnpm check:package
pnpm check:next  # after build: Next.js server rendering and hydration
pnpm changeset   # if the change affects the published package
```

## Releases

1. A change to the published package comes with a changeset (`pnpm changeset`): patch, minor or major,
   and a line for the changelog.
2. After CI passes on `main`, `.github/workflows/release.yml` opens or updates the "Version Packages"
   pull request, which bumps the version and writes `CHANGELOG.md`.
3. Merging it publishes to npm from GitHub Actions through trusted publishing (no token, with
   provenance) and tags the release.
