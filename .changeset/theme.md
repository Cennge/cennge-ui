---
"cennge-ui": minor
---

Theme switching without a flash and without a hydration error. `ThemeScript`, in the page's `<head>`, shows the stored theme before the first paint and follows the system and other tabs. `useTheme()` gives `theme`, `resolvedTheme` and `setTheme`, undefined until the page has hydrated, so the first render matches the server's HTML. `ThemeSwitch` is a light / dark / system control on top of it. In an app without server rendering, `initTheme()` does ThemeScript's job.
