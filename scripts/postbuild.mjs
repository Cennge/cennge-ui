import { cpSync, rmSync } from "node:fs";

cpSync("src/styles.css", "dist/styles.css");
// The per-component entries only exist to cut the ESM build into one chunk per component (tsup.config.ts);
// index.js imports the chunks directly, so the entry files are left out of the package.
rmSync("dist/components", { recursive: true, force: true });
