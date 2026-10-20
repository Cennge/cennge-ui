"use client";

import { setMapWorkerUrl } from "cennge-ui/map";

// MapLibre's worker files, copied to public/maplibre (see the README's Map section).
setMapWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

export function MapWorker() {
  return null;
}
