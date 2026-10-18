import { defineConfig, type Options } from "tsup";

const shared: Options = {
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  // No `treeshake`: it routes the bundle through Rollup, which strips the "use client" banner.
  // Consumers still tree-shake: the output is ESM and the package is sideEffects-free.
  external: ["react", "react-dom", "react/jsx-runtime"],
};

export default defineConfig([
  // Components and Provider: every file is a client component.
  {
    ...shared,
    entry: { index: "src/index.ts" },
    // No `clean` here: both builds run in parallel and it would delete the other one's output.
    // dist/ is wiped by scripts/clean.mjs before tsup starts.
    banner: { js: '"use client";' },
  },
  // Pure helpers (cn, tv) stay server-safe so they can be called inside React Server Components.
  {
    ...shared,
    entry: { utils: "src/utils/index.ts" },
  },
]);
