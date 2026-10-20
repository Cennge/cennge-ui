import * as React from "react";
import type { LngLat } from "./context";
import { useGeoJSONLayers, useLayerId } from "./layers";
import { lineLayers, type MapRouteProps } from "./route";

export interface MapArcProps extends Omit<MapRouteProps, "coordinates" | "width"> {
  /** Pairs of points, each joined by a curve: flights, shipments, transfers. */
  arcs: readonly { from: LngLat; to: LngLat }[];
  /** How far a curve bows out, as a share of its length; negative bows the other way. @default 0.2 */
  curvature?: number;
  /** In pixels. @default 2 */
  width?: number;
}

const SEGMENTS = 48;

/**
 * A curve from one point to another: a quadratic Bézier in longitude and latitude, its control point
 * off the middle by `curvature` of the distance, to the left of the way from `from` to `to`.
 */
export function arcPoints(from: LngLat, to: LngLat, curvature: number): LngLat[] {
  const [x1, y1] = from;
  // The short way round: a pair across the 180th meridian does not cross the whole map.
  const x2 = to[0] - x1 > 180 ? to[0] - 360 : x1 - to[0] > 180 ? to[0] + 360 : to[0];
  const y2 = to[1];
  const control: LngLat = [(x1 + x2) / 2 - (y2 - y1) * curvature, (y1 + y2) / 2 + (x2 - x1) * curvature];
  return Array.from({ length: SEGMENTS + 1 }, (_, index) => {
    const t = index / SEGMENTS;
    const a = (1 - t) ** 2;
    const b = 2 * (1 - t) * t;
    const c = t ** 2;
    return [a * x1 + b * control[0] + c * x2, a * y1 + b * control[1] + c * y2] as LngLat;
  });
}

/** Curves between pairs of points, in a token's colour, under the place names. */
export function MapArc({ arcs, curvature = 0.2, width = 2, hasOutline = false, ...look }: MapArcProps) {
  const id = useLayerId("arc");
  const data = React.useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: arcs.map(({ from, to }) => ({
        type: "Feature" as const,
        properties: {},
        geometry: { type: "LineString" as const, coordinates: arcPoints(from, to, curvature) },
      })),
    }),
    [JSON.stringify(arcs), curvature],
  );
  const options = { ...look, width, hasOutline };
  useGeoJSONLayers({
    id,
    data,
    layers: (container) => lineLayers(id, container, options),
    paintDeps: [look.color, width, look.dashed, look.opacity, hasOutline],
  });
  return null;
}
