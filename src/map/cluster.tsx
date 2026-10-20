import * as React from "react";
import type { GeoJSONSource, MapGeoJSONFeature } from "maplibre-gl";
import { useCenngeDefaults } from "../provider";
import { tv } from "../utils/tv";
import type { CenngeColor } from "../types";
import { useMapContext, type LngLat } from "./context";
import { useGeoJSONLayers, useLayerId } from "./layers";
import { prefersReducedMotion } from "./maplibre";
import { MapMarker } from "./marker";

const bubble = tv({
  base: [
    "flex items-center justify-center rounded-full font-semibold tabular-nums shadow-raised ring-[3px] ring-white",
    "transition-transform duration-150 group-hover/marker:scale-110 motion-reduce:transition-none dark:ring-surface-1",
  ],
  variants: {
    // Round, and wider for a long number.
    size: { sm: "h-8 min-w-8 px-1.5 text-xs", md: "h-10 min-w-10 px-2 text-sm", lg: "h-12 min-w-12 px-2.5 text-sm" },
    color: {
      default: "bg-default-500 text-white",
      primary: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      success: "bg-success text-success-foreground",
      warning: "bg-warning text-warning-foreground",
      danger: "bg-danger text-danger-foreground",
      info: "bg-info text-info-foreground",
    },
  },
});

export interface MapClusterLayerProps<T> {
  items: readonly T[];
  getLngLat: (item: T) => LngLat;
  /** Each point's name, read by screen readers and shown as its tooltip. */
  getLabel: (item: T) => string;
  onItemClick?: (item: T) => void;
  /** @default "primary" */
  color?: CenngeColor;
  /**
   * A group's name, e.g. (count, shown) => `${shown} stores`. `shown` is the number on the group, in the
   * locale's digits: put it in the name, so what is seen can be said (voice control, WCAG 2.5.3).
   * @default "{shown} points"
   */
  clusterLabel?: (count: number, shown: string) => string;
  /** How close points join a group, in pixels. @default 60 */
  radius?: number;
  /** From this zoom on, every point stands alone. @default 14 */
  maxZoom?: number;
}

type Shown =
  | { kind: "cluster"; key: string; lngLat: LngLat; count: number; clusterId: number }
  | { kind: "item"; key: string; lngLat: LngLat; index: number };

/**
 * Thousands of points, grouped where they crowd. Groups and points alike are markers: buttons in the tab
 * order. A group, clicked, zooms in until it comes apart. Only what is in view is in the page.
 */
export function MapClusterLayer<T>({
  items,
  getLngLat,
  getLabel,
  onItemClick,
  color = "primary",
  clusterLabel,
  radius = 60,
  maxZoom = 14,
}: MapClusterLayerProps<T>) {
  const { container, styleRevision } = useMapContext("MapClusterLayer");
  const { locale = "en-US" } = useCenngeDefaults();
  const id = useLayerId("cluster");
  const data = React.useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: items.map((item, index) => ({
        type: "Feature" as const,
        properties: { index },
        geometry: { type: "Point" as const, coordinates: getLngLat(item) },
      })),
    }),
    [items],
  );
  const map = useGeoJSONLayers({
    id,
    data,
    source: { cluster: true, clusterRadius: radius, clusterMaxZoom: maxZoom },
    // Nothing is drawn by MapLibre: the layer only makes it build the groups. The markers are ours.
    layers: () => [{ id: `${id}-points`, type: "circle", source: id, paint: { "circle-radius": 0, "circle-opacity": 0 } }],
    paintDeps: [],
  });

  // What is in view, read again once a move settles or the data has been grouped.
  const [shown, setShown] = React.useState<Shown[]>([]);
  React.useEffect(() => {
    let frame = 0;
    const read = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!map.getSource(id)) return;
        const bounds = map.getBounds();
        const seen = new Set<string>();
        const next: Shown[] = [];
        for (const feature of map.querySourceFeatures(id) as MapGeoJSONFeature[]) {
          const [lng, lat] = (feature.geometry as { coordinates: LngLat }).coordinates;
          if (!bounds.contains([lng, lat])) continue;
          const properties = feature.properties as { cluster_id?: number; point_count?: number; index?: number };
          const key = properties.cluster_id !== undefined ? `c${properties.cluster_id}` : `p${properties.index}`;
          // A feature on the edge of two tiles comes once from each.
          if (seen.has(key)) continue;
          seen.add(key);
          next.push(
            properties.cluster_id !== undefined
              ? { kind: "cluster", key, lngLat: [lng, lat], count: properties.point_count ?? 0, clusterId: properties.cluster_id }
              : { kind: "item", key, lngLat: [lng, lat], index: properties.index ?? 0 },
          );
        }
        setShown(next);
      });
    };
    const onData = (event: { sourceId?: string; isSourceLoaded?: boolean }) => {
      if (event.sourceId === id && event.isSourceLoaded) read();
    };
    read();
    map.on("moveend", read);
    map.on("sourcedata", onData);
    return () => {
      cancelAnimationFrame(frame);
      map.off("moveend", read);
      map.off("sourcedata", onData);
    };
  }, [map, id, data, styleRevision]);

  const count = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const nameGroup = clusterLabel ?? ((_count: number, shown: string) => `${shown} points`);

  const expand = async (group: Extract<Shown, { kind: "cluster" }>) => {
    const source = map.getSource(id) as GeoJSONSource | undefined;
    if (!source) return;
    const zoom = await source.getClusterExpansionZoom(group.clusterId);
    map.easeTo({ center: group.lngLat, zoom, animate: !prefersReducedMotion(container) });
  };

  return (
    <>
      {shown.map((entry) => {
        if (entry.kind === "cluster") {
          const size = entry.count < 10 ? "sm" : entry.count < 100 ? "md" : "lg";
          const shown = count.format(entry.count);
          return (
            <MapMarker key={entry.key} lngLat={entry.lngLat} label={nameGroup(entry.count, shown)} onClick={() => void expand(entry)}>
              <span aria-hidden="true" className={bubble({ size, color })}>
                {shown}
              </span>
            </MapMarker>
          );
        }
        const item = items[entry.index];
        if (item === undefined) return null;
        const label = getLabel(item);
        return (
          <MapMarker
            key={entry.key}
            lngLat={entry.lngLat}
            label={label}
            tooltip={label}
            color={color}
            onClick={onItemClick ? () => onItemClick(item) : undefined}
          />
        );
      })}
    </>
  );
}
