import * as React from "react";
import type { GeoJSONSource, GeoJSONSourceSpecification, LayerSpecification } from "maplibre-gl";
import type { CenngeColor } from "../types";
import { useMapContext } from "./context";
import type { MapLibreMap } from "./maplibre";

/** A token's colour as MapLibre needs it: the custom property, with its var() references resolved. */
export function tokenColor(node: Element, name: string): string {
  return getComputedStyle(node).getPropertyValue(name).trim() || "#888888";
}

/** The token of a colour prop: the colour itself, or a step of its scale. "default" has no solid of its own. */
export function colorToken(color: CenngeColor, step?: number): string {
  if (step !== undefined) return `--cennge-${color}-${step}`;
  return color === "default" ? "--cennge-default-500" : `--cennge-${color}`;
}

let layerGroups = 0;

/** Ids for a component's own source and layers: client-only, so a counter will do, the same from the first render. */
export function useLayerId(kind: string): string {
  const [id] = React.useState(() => `cennge-${kind}-${++layerGroups}`);
  return id;
}

type PaintKey = Parameters<MapLibreMap["setPaintProperty"]>[1];
type SourceData = GeoJSONSourceSpecification["data"];

interface GeoJSONLayersOptions {
  id: string;
  data: SourceData;
  /** Options of the source besides its data, e.g. clustering. Read when the source is added. */
  source?: Omit<GeoJSONSourceSpecification, "type" | "data">;
  /** The layers, built with the theme's colours read now. Null while there is no container to read them from. */
  layers: (container: Element) => LayerSpecification[];
  /** What the layers' paint depends on besides the theme. */
  paintDeps: React.DependencyList;
}

/**
 * A GeoJSON source and its layers, added with each style (a new style starts without them) under the
 * map's place names, given new data or new colours as those change, and removed with the component.
 */
export function useGeoJSONLayers({ id, data, source, layers, paintDeps }: GeoJSONLayersOptions) {
  const { map: mapOrNull, container, styleRevision, themeRevision } = useMapContext("a map layer");
  const map = mapOrNull!;
  const latest = React.useRef({ data, source, layers });
  latest.current = { data, source, layers };
  // Which layers exist, with which paint properties; when that changes they are added again (a property
  // dropped from the paint, say a dash, is undone that way).
  const shape = container
    ? layers(container)
        .map((layer) => `${layer.id}:${layer.type}:${Object.keys(("paint" in layer && layer.paint) || {}).join(",")}`)
        .join("|")
    : "";

  React.useEffect(() => {
    if (styleRevision === null || !container) return;
    const specs = latest.current.layers(container);
    const beforeId = map.getStyle().layers.find((layer) => layer.type === "symbol")?.id;
    map.addSource(id, { ...latest.current.source, type: "geojson", data: latest.current.data });
    for (const spec of specs) map.addLayer(spec, beforeId);
    return () => {
      // After a style swap, or once the map is gone, there is nothing left to remove.
      if (!map.getStyle?.()) return;
      for (const spec of [...specs].reverse()) if (map.getLayer(spec.id)) map.removeLayer(spec.id);
      if (map.getSource(id)) map.removeSource(id);
    };
  }, [map, container, styleRevision, shape]);

  React.useEffect(() => {
    (map.getSource(id) as GeoJSONSource | undefined)?.setData(data);
  }, [map, data]);

  React.useEffect(() => {
    if (!container) return;
    for (const spec of latest.current.layers(container)) {
      if (!map.getLayer(spec.id) || !("paint" in spec) || !spec.paint) continue;
      for (const [key, value] of Object.entries(spec.paint)) map.setPaintProperty(spec.id, key as PaintKey, value);
    }
  }, [map, container, themeRevision, styleRevision, ...paintDeps]);

  return map;
}
