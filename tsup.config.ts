import { readFileSync } from "node:fs";
import { defineConfig, type Options } from "tsup";

const shared: Options = {
  sourcemap: true,
  // No `treeshake`: it routes the bundle through Rollup, which strips the "use client" banner.
  // maplibre-gl: an optional peer, loaded by cennge-ui/map only when a map mounts.
  external: ["react", "react-dom", "react/jsx-runtime", "maplibre-gl"],
};

/** One entry per component exported from src/index.ts, so new components get one by themselves. */
const components = Object.fromEntries(
  Array.from(readFileSync("src/index.ts", "utf8").matchAll(/from "\.\/components\/([\w-]+)"/g), ([, name]) => [
    `components/${name}`,
    `src/components/${name}/index.ts`,
  ]),
);

// No `clean` anywhere: the builds run in parallel and would delete each other's output.
// dist/ is wiped by scripts/clean.mjs before tsup starts.
export default defineConfig([
  // ESM, split by component. index.js only re-exports from the components' chunks, so a bundler keeps the
  // chunks a page imports and drops the rest (the package has no side effects but its CSS). As one file,
  // importing just Button pulled in 87% of the library.
  {
    ...shared,
    format: ["esm"],
    // cennge-ui/map shares the chunks too: one provider context, one copy of the helpers.
    entry: { index: "src/index.ts", map: "src/map/index.ts", ...components },
    splitting: true,
    dts: { entry: { index: "src/index.ts", map: "src/map/index.ts" } },
    // Every file is a client component.
    banner: { js: '"use client";' },
  },
  // CommonJS: one file. require() is not tree-shaken anyway, and split per entry it would repeat shared code.
  {
    ...shared,
    format: ["cjs"],
    entry: { index: "src/index.ts" },
    dts: { entry: { index: "src/index.ts" } },
    banner: { js: '"use client";' },
  },
  // Pure helpers (cn, tv) stay server-safe so they can be called inside React Server Components.
  {
    ...shared,
    format: ["esm", "cjs"],
    entry: { utils: "src/utils/index.ts" },
    dts: true,
  },
]);
