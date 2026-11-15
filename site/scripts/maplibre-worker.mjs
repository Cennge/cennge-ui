// MapLibre draws in a worker that bundlers do not find on their own: the site serves its files from
// public/maplibre/, and examples/map/map-worker.tsx tells cennge-ui/map where they are (README, "Map").
// node scripts/maplibre-worker.mjs  (from site/; run before `next dev` and `next build`)
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";

const require = createRequire(import.meta.url);
const dist = join(dirname(require.resolve("maplibre-gl/package.json")), "dist");
const out = resolve(import.meta.dirname, "../public/maplibre");

mkdirSync(out, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) copyFileSync(join(dist, file), join(out, file));
console.log("maplibre: worker -> public/maplibre/");
