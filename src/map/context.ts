import * as React from "react";
import type { MapLibreMap, MapLibreModule } from "./maplibre";

/** A point as [longitude, latitude], the order GeoJSON and MapLibre use. */
export type LngLat = [longitude: number, latitude: number];

export interface MapLabels {
  /** The map itself, for keyboard users: read when it takes focus. */
  canvas: string;
  zoomIn: string;
  zoomOut: string;
  resetNorth: string;
  locate: string;
  locationUnavailable: string;
  yourLocation: string;
  enterFullscreen: string;
  exitFullscreen: string;
  close: string;
  loadError: string;
  attribution: string;
}

export const defaultMapLabels: MapLabels = {
  canvas: "Map. Arrow keys move it, plus and minus zoom.",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  resetNorth: "Point north",
  locate: "Show my location",
  locationUnavailable: "Your location is not available",
  yourLocation: "Your location",
  enterFullscreen: "Full screen",
  exitFullscreen: "Exit full screen",
  close: "Close",
  loadError: "The map could not be loaded",
  attribution: "Map data",
};

export interface MapContextValue {
  /** Null until maplibre-gl has loaded and the map exists. */
  map: MapLibreMap | null;
  lib: MapLibreModule | null;
  /** The element the map fills; overlays are positioned in it. */
  container: HTMLDivElement | null;
  /**
   * Null while a style loads, then a number that grows with each style: layers added by components are
   * gone after a swap and are added again. (map.isStyleLoaded() is false while any source loads, too.)
   */
  styleRevision: number | null;
  /** Grows when the theme or the accent changes, so colours read from tokens are read again. */
  themeRevision: number;
  theme: "light" | "dark";
  labels: MapLabels;
}

export const MapContext = React.createContext<MapContextValue | null>(null);

export function useMapContext(component: string): MapContextValue {
  const context = React.useContext(MapContext);
  if (!context) throw new Error(`<${component}> must be used inside <Map>.`);
  return context;
}

/** The MapLibre map inside the nearest <Map>, for anything the components do not cover. Null until loaded. */
export function useMap(): MapLibreMap | null {
  return useMapContext("useMap").map;
}
