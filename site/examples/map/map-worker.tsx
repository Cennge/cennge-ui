"use client";

import { setMapWorkerUrl } from "cennge-ui/map";

// MapLibre's worker files, copied to public/maplibre/ by scripts/maplibre-worker.mjs. Set when this module
// loads, which is before any map on the page mounts.
setMapWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

export function MapWorker() {
  return null;
}
