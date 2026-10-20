import * as React from "react";
import type { GeoJSONSource, LineLayerSpecification } from "maplibre-gl";
import type { CenngeColor } from "../types";
import { useMapContext, type LngLat } from "./context";
import type { MapLibreMap } from "./maplibre";

export interface MapRouteProps {
  /** The line's points, in order. */
  coordinates: LngLat[];
  /** @default "primary" */
  color?: CenngeColor;
  /** In pixels. @default 4 */
  width?: number;
  dashed?: boolean;
  /** @default 1 */
  opacity?: number;
  /** An edge in the background colour, so the line reads over any street or park. @default true */
  hasOutline?: boolean;
}

/** A token's colour as MapLibre needs it: the custom property, with its var() references resolved. */
function tokenColor(node: Element, name: string): string {
  return getComputedStyle(node).getPropertyValue(name).trim() || "#888888";
}

function toFeature(coordinates: LngLat[]) {
  return { type: "Feature" as const, properties: {}, geometry: { type: "LineString" as const, coordinates } };
}

let routes = 0;

type PaintKey = Parameters<MapLibreMap["setPaintProperty"]>[1];

/** A line along points: a route, a track, a border. Drawn under the map's place names. */
export function MapRoute({ coordinates, color = "primary", width = 4, dashed = false, opacity = 1, hasOutline = true }: MapRouteProps) {
  const { map: mapOrNull, container, styleRevision, themeRevision } = useMapContext("MapRoute");
  const map = mapOrNull!;
  // Ids of the map's own layers: client-only, so a counter will do, and it is the same from the first render.
  const [id] = React.useState(() => `cennge-route-${++routes}`);
  const ids = { source: id, line: `${id}-line`, outline: `${id}-outline` };
  const data = React.useMemo(() => toFeature(coordinates), [JSON.stringify(coordinates)]);
  const latestData = React.useRef(data);
  latestData.current = data;

  const paint = React.useCallback(() => {
    if (!container) return null;
    const line = tokenColor(container, color === "default" ? "--cennge-default-500" : `--cennge-${color}`);
    const edge = tokenColor(container, "--cennge-background");
    return {
      line: {
        "line-color": line,
        "line-width": width,
        "line-opacity": opacity,
        ...(dashed ? { "line-dasharray": [2, 1.5] } : {}),
      } satisfies LineLayerSpecification["paint"],
      outline: { "line-color": edge, "line-width": width + 4, "line-opacity": opacity } satisfies LineLayerSpecification["paint"],
    };
  }, [container, color, width, opacity, dashed]);

  // Added once per style: a new style (the other theme's) starts without them.
  React.useEffect(() => {
    if (styleRevision === null) return;
    const colours = paint();
    if (!colours) return;
    // Under the first layer of labels, so place names stay on top.
    const beforeId = map.getStyle().layers.find((layer) => layer.type === "symbol")?.id;
    const layout = { "line-join": "round", "line-cap": "round" } as const;
    map.addSource(ids.source, { type: "geojson", data: latestData.current });
    if (hasOutline) {
      map.addLayer({ id: ids.outline, type: "line", source: ids.source, layout, paint: colours.outline }, beforeId);
    }
    map.addLayer({ id: ids.line, type: "line", source: ids.source, layout, paint: colours.line }, beforeId);
    return () => {
      // After a style swap, or once the map is gone, there is nothing left to remove.
      if (!map.getStyle?.()) return;
      for (const layer of [ids.line, ids.outline]) if (map.getLayer(layer)) map.removeLayer(layer);
      if (map.getSource(ids.source)) map.removeSource(ids.source);
    };
  }, [map, styleRevision, hasOutline]);

  React.useEffect(() => {
    (map.getSource(ids.source) as GeoJSONSource | undefined)?.setData(data);
  }, [map, data]);

  // New colours when the theme or the accent changes, or the props do.
  React.useEffect(() => {
    const colours = paint();
    if (!colours || !map.getLayer(ids.line)) return;
    map.setPaintProperty(ids.line, "line-dasharray", dashed ? [2, 1.5] : undefined);
    for (const [key, value] of Object.entries(colours.line)) map.setPaintProperty(ids.line, key as PaintKey, value);
    if (map.getLayer(ids.outline)) {
      for (const [key, value] of Object.entries(colours.outline)) map.setPaintProperty(ids.outline, key as PaintKey, value);
    }
  }, [map, paint, themeRevision, styleRevision]);

  return null;
}
