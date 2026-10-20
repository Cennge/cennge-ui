import * as React from "react";
import type { LineLayerSpecification } from "maplibre-gl";
import type { CenngeColor } from "../types";
import type { LngLat } from "./context";
import { colorToken, tokenColor, useGeoJSONLayers, useLayerId } from "./layers";

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

/** Line layers for lines in a token's colour, with an optional edge in the background's colour under them. */
export function lineLayers(
  id: string,
  container: Element,
  { color = "primary", width = 4, dashed = false, opacity = 1, hasOutline = true }: Omit<MapRouteProps, "coordinates">,
): LineLayerSpecification[] {
  const layout = { "line-join": "round", "line-cap": "round" } as const;
  const line: LineLayerSpecification = {
    id: `${id}-line`,
    type: "line",
    source: id,
    layout,
    paint: {
      "line-color": tokenColor(container, colorToken(color)),
      "line-width": width,
      "line-opacity": opacity,
      ...(dashed ? { "line-dasharray": [2, 1.5] } : {}),
    },
  };
  if (!hasOutline) return [line];
  const outline: LineLayerSpecification = {
    id: `${id}-outline`,
    type: "line",
    source: id,
    layout,
    paint: { "line-color": tokenColor(container, "--cennge-background"), "line-width": width + 4, "line-opacity": opacity },
  };
  return [outline, line];
}

/** A line along points: a route, a track, a border. Drawn under the map's place names. */
export function MapRoute({ coordinates, ...look }: MapRouteProps) {
  const id = useLayerId("route");
  const data = React.useMemo(
    () => ({ type: "Feature" as const, properties: {}, geometry: { type: "LineString" as const, coordinates } }),
    [JSON.stringify(coordinates)],
  );
  useGeoJSONLayers({
    id,
    data,
    layers: (container) => lineLayers(id, container, look),
    paintDeps: [look.color, look.width, look.dashed, look.opacity, look.hasOutline],
  });
  return null;
}
