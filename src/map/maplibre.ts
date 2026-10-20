import type * as MapLibre from "maplibre-gl";

export type MapLibreModule = typeof MapLibre;
export type MapLibreMap = MapLibre.Map;
export type MapStyle = string | MapLibre.StyleSpecification;

let pending: Promise<MapLibreModule> | null = null;
let workerUrl: string | null = null;

/**
 * Where MapLibre's worker script is served from. Bundlers do not find it on their own, so the app tells
 * it once, at startup, e.g. with Vite:
 *
 *   import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
 *   setMapWorkerUrl(workerUrl);
 *
 * Unlike maplibre-gl's own setWorkerUrl, this does not import maplibre-gl: it still loads only with a map.
 */
export function setMapWorkerUrl(url: string) {
  workerUrl = url;
  void pending?.then((lib) => lib.setWorkerUrl(url));
}

/** maplibre-gl, fetched when the first map mounts: pages without a map never download it. */
export function loadMapLibre(): Promise<MapLibreModule> {
  pending ??= import("maplibre-gl").then(
    (lib) => {
      if (workerUrl) lib.setWorkerUrl(workerUrl);
      return lib;
    },
    (error: unknown) => {
      pending = null;
      throw error;
    },
  );
  return pending;
}

/**
 * OpenFreeMap's own styles: no key, no usage limits, commercial use allowed. Data © OpenStreetMap
 * contributors. The map's default is Positron recoloured with the theme's tokens; these are as published.
 */
export const openFreeMapStyles = {
  positron: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
  fiord: "https://tiles.openfreemap.org/styles/fiord",
  liberty: "https://tiles.openfreemap.org/styles/liberty",
  bright: "https://tiles.openfreemap.org/styles/bright",
} as const satisfies Record<string, MapStyle>;

/** A style with nothing but a background in the theme's colour: for data drawn on its own, and for tests. */
export function blankMapStyle(background: string): MapLibre.StyleSpecification {
  return {
    version: 8,
    sources: {},
    layers: [{ id: "background", type: "background", paint: { "background-color": background } }],
  };
}

/** Motion off when the user asks for it, or inside <CenngeProvider reducedMotion="always">. */
export function prefersReducedMotion(node: Element | null): boolean {
  if (node?.closest('[data-cennge-motion="reduce"]')) return true;
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
