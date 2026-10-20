import * as React from "react";
import type { ExpressionSpecification, GeoJSONSourceSpecification, LayerSpecification, MapLayerMouseEvent } from "maplibre-gl";
import { useCenngeDefaults } from "../provider";
import { cn } from "../utils/cn";
import type { CenngeColor } from "../types";
import { useMapContext, type LngLat } from "./context";
import { colorToken, tokenColor, useGeoJSONLayers, useLayerId } from "./layers";

type Properties = Record<string, unknown>;

/** Steps of a colour's scale from low to high values: light to dark on a light map, dark to light on a dark one. */
export function rampSteps(theme: "light" | "dark") {
  return theme === "dark" ? [800, 500, 300] : [100, 400, 700];
}

export interface MapGeoJSONProps {
  /** A FeatureCollection, a single feature, or the URL of one. Areas, lines and points are all drawn. */
  data: GeoJSONSourceSpecification["data"];
  /** @default "primary" */
  color?: CenngeColor;
  /** Shades each feature by this number in its properties, along the colour's scale: a choropleth. */
  valueProperty?: string;
  /** The values at the light and the dark end. @default the data's lowest and highest (give it for a URL) */
  domain?: [min: number, max: number];
  /** Of areas. @default 0.75 */
  fillOpacity?: number;
  /** Thin edges between areas. @default true */
  hasOutline?: boolean;
  /** Shown at the pointer over a feature, or where it was tapped. */
  tooltip?: (properties: Properties) => React.ReactNode;
  onFeatureClick?: (properties: Properties, lngLat: LngLat) => void;
}

export function dataDomain(data: GeoJSONSourceSpecification["data"], property: string): [number, number] {
  const values: number[] = [];
  const collect = (feature: unknown) => {
    const value = (feature as { properties?: Properties } | null)?.properties?.[property];
    if (typeof value === "number" && Number.isFinite(value)) values.push(value);
  };
  if (typeof data === "object" && data) {
    if ("features" in data && Array.isArray(data.features)) data.features.forEach(collect);
    else collect(data);
  }
  if (values.length === 0) return [0, 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? [min, min + 1] : [min, max];
}

/** The tooltip at the pointer, kept apart so moving the pointer renders nothing but it. */
interface PointerTooltipHandle {
  show: (x: number, y: number, content: React.ReactNode) => void;
  hide: () => void;
}

const PointerTooltip = React.forwardRef<PointerTooltipHandle>(function PointerTooltip(_props, ref) {
  const [tip, setTip] = React.useState<{ x: number; y: number; content: React.ReactNode } | null>(null);
  React.useImperativeHandle(ref, () => ({ show: (x, y, content) => setTip({ x, y, content }), hide: () => setTip(null) }), []);
  if (!tip) return null;
  return (
    <div
      role="tooltip"
      data-slot="map-tooltip"
      className={cn(
        "pointer-events-none absolute top-0 left-0 z-[4] w-max max-w-64 -translate-x-1/2 -translate-y-full",
        "rounded-small border border-border bg-surface-4 px-2 py-1 text-xs font-medium text-foreground shadow-floating",
      )}
      // Just above the pointer, clear of the cursor.
      style={{ transform: `translate(${Math.round(tip.x)}px, ${Math.round(tip.y - 12)}px)` }}
    >
      {tip.content}
    </div>
  );
});

/**
 * GeoJSON on the map: areas, lines and points in a token's colour, or shaded by a value along its scale
 * (a choropleth; pair it with MapLegend). Hover highlights a feature and shows `tooltip`. What is drawn
 * here is a picture: give screen readers the same data another way, e.g. a table.
 */
export function MapGeoJSON({
  data,
  color = "primary",
  valueProperty,
  domain: domainProp,
  fillOpacity = 0.75,
  hasOutline = true,
  tooltip,
  onFeatureClick,
}: MapGeoJSONProps) {
  const { theme } = useMapContext("MapGeoJSON");
  const id = useLayerId("geojson");
  const tooltipRef = React.useRef<PointerTooltipHandle>(null);
  const domain = React.useMemo(
    () => domainProp ?? (valueProperty ? dataDomain(data, valueProperty) : ([0, 1] as [number, number])),
    [domainProp?.[0], domainProp?.[1], valueProperty, data],
  );

  const layers = (container: Element): LayerSpecification[] => {
    const solid = tokenColor(container, colorToken(color));
    let fill: string | ExpressionSpecification = solid;
    if (valueProperty) {
      const [low, middle, high] = rampSteps(theme).map((step) => tokenColor(container, colorToken(color, step)));
      const [min, max] = domain;
      fill = [
        "case",
        ["==", ["typeof", ["get", valueProperty]], "number"],
        ["interpolate", ["linear"], ["get", valueProperty], min, low!, (min + max) / 2, middle!, max, high!],
        "rgba(0, 0, 0, 0)",
      ];
    }
    const hovered = ["boolean", ["feature-state", "hover"], false] as ExpressionSpecification;
    const edge = tokenColor(container, "--cennge-background");
    const strong = tokenColor(container, "--cennge-foreground");
    const isArea = ["match", ["geometry-type"], ["Polygon", "MultiPolygon"], true, false] as ExpressionSpecification;
    const isLine = ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false] as ExpressionSpecification;
    const isPoint = ["match", ["geometry-type"], ["Point", "MultiPoint"], true, false] as ExpressionSpecification;
    const specs: LayerSpecification[] = [
      {
        id: `${id}-fill`,
        type: "fill",
        source: id,
        filter: isArea,
        paint: { "fill-color": fill, "fill-opacity": ["case", hovered, Math.min(1, fillOpacity + 0.15), fillOpacity] },
      },
    ];
    if (hasOutline) {
      specs.push({
        id: `${id}-edge`,
        type: "line",
        source: id,
        filter: isArea,
        paint: { "line-color": ["case", hovered, strong, edge], "line-width": ["case", hovered, 2, 0.75] },
      });
    }
    specs.push(
      {
        id: `${id}-line`,
        type: "line",
        source: id,
        filter: isLine,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": fill, "line-width": ["case", hovered, 4, 2.5] },
      },
      {
        id: `${id}-point`,
        type: "circle",
        source: id,
        filter: isPoint,
        paint: {
          "circle-color": fill,
          "circle-radius": ["case", hovered, 8, 6],
          "circle-stroke-color": edge,
          "circle-stroke-width": 2,
        },
      },
    );
    return specs;
  };

  const map = useGeoJSONLayers({
    id,
    data,
    // Numbered features, so hover can be kept per feature.
    source: { generateId: true },
    layers,
    paintDeps: [color, valueProperty, domain[0], domain[1], fillOpacity, hasOutline, theme],
  });

  const latest = React.useRef({ tooltip, onFeatureClick });
  latest.current = { tooltip, onFeatureClick };
  const isInteractive = tooltip !== undefined || onFeatureClick !== undefined;

  React.useEffect(() => {
    const layerIds = [`${id}-fill`, `${id}-line`, `${id}-point`];
    let hovered: string | number | undefined;
    const setHover = (next: string | number | undefined) => {
      if (hovered === next) return;
      if (hovered !== undefined && map.getSource(id)) map.setFeatureState({ source: id, id: hovered }, { hover: false });
      hovered = next;
      if (next !== undefined) map.setFeatureState({ source: id, id: next }, { hover: true });
    };
    const onMove = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      setHover(feature?.id);
      if (isInteractive) map.getCanvas().style.cursor = "pointer";
      const content = feature && latest.current.tooltip?.(feature.properties);
      if (content) tooltipRef.current?.show(event.point.x, event.point.y, content);
    };
    const onLeave = () => {
      setHover(undefined);
      map.getCanvas().style.cursor = "";
      tooltipRef.current?.hide();
    };
    const onClick = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) return;
      // A tap has no hover: it shows the tooltip where it was.
      const content = latest.current.tooltip?.(feature.properties);
      if (content) tooltipRef.current?.show(event.point.x, event.point.y, content);
      latest.current.onFeatureClick?.(feature.properties, [event.lngLat.lng, event.lngLat.lat]);
    };
    // A click away from every feature hides a tapped tooltip.
    const onMapClick = (event: { point: { x: number; y: number } }) => {
      const present = layerIds.filter((layer) => map.getLayer(layer));
      if (map.queryRenderedFeatures([event.point.x, event.point.y], { layers: present }).length === 0) onLeave();
    };
    for (const layer of layerIds) {
      map.on("mousemove", layer, onMove);
      map.on("mouseleave", layer, onLeave);
      map.on("click", layer, onClick);
    }
    map.on("click", onMapClick);
    return () => {
      for (const layer of layerIds) {
        map.off("mousemove", layer, onMove);
        map.off("mouseleave", layer, onLeave);
        map.off("click", layer, onClick);
      }
      map.off("click", onMapClick);
    };
  }, [map, id, isInteractive]);

  return <PointerTooltip ref={tooltipRef} />;
}

export interface MapLegendProps {
  /** What the shades stand for, e.g. "Downloads per month". */
  title: React.ReactNode;
  /** The colour of the MapGeoJSON it explains. @default "primary" */
  color?: CenngeColor;
  /** Its domain: the values at the two ends. */
  domain: [min: number, max: number];
  /** @default numbers in the provider's locale */
  format?: (value: number) => string;
  /** @default "bottom-left" */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}

const legendPositions = {
  "top-left": "top-2.5 left-2.5",
  "top-right": "top-2.5 right-2.5",
  "bottom-left": "bottom-7 left-2.5",
  "bottom-right": "right-2.5 bottom-7",
} as const;

/** The scale of a choropleth: its title, the shades from low to high, and the values at both ends. */
export function MapLegend({ title, color = "primary", domain, format, position = "bottom-left", className }: MapLegendProps) {
  const { theme } = useMapContext("MapLegend");
  const { locale = "en-US" } = useCenngeDefaults();
  const numbers = React.useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);
  const show = format ?? ((value: number) => numbers.format(value));
  const stops = rampSteps(theme).map((step) => `var(${colorToken(color, step)})`);
  return (
    <div
      role="group"
      aria-label={typeof title === "string" ? title : undefined}
      data-slot="map-legend"
      className={cn(
        "pointer-events-auto absolute z-[5] w-48 rounded-medium border border-border bg-surface-3/95 p-2.5 shadow-raised backdrop-blur-sm",
        legendPositions[position],
        className,
      )}
    >
      <p className="mb-1.5 text-xs font-semibold text-foreground">{title}</p>
      <div aria-hidden="true" className="h-2 rounded-full" style={{ backgroundImage: `linear-gradient(to right, ${stops.join(", ")})` }} />
      <div className="mt-1 flex justify-between text-[11px] text-muted tabular-nums">
        <span>{show(domain[0])}</span>
        <span>{show(domain[1])}</span>
      </div>
    </div>
  );
}
