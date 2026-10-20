import * as React from "react";
import { cn } from "../utils/cn";
import { MapAttribution } from "./attribution";
import { MapContext, defaultMapLabels, type LngLat, type MapContextValue, type MapLabels } from "./context";
import { loadMapLibre, openFreeMapStyles, type MapLibreMap, type MapLibreModule, type MapStyle } from "./maplibre";
import { readPalette, tintStyle } from "./palette";

export interface MapView {
  center: LngLat;
  zoom: number;
  bearing: number;
  pitch: number;
}

export interface MapProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onClick" | "onLoad"> {
  /** Where the map opens. @default [0, 20] */
  defaultCenter?: LngLat;
  /** @default 1.5 */
  defaultZoom?: number;
  /**
   * Opens on this area instead, at whatever zoom fits it: say, around every marker. Its corners are
   * south-west and north-east. Wins over defaultCenter and defaultZoom.
   */
  defaultBounds?: [southWest: LngLat, northEast: LngLat];
  /** Room around defaultBounds, in pixels: e.g. more on the side of the controls. @default 48 */
  boundsPadding?: number | { top: number; right: number; bottom: number; left: number };
  /** Rotation in degrees, clockwise from north. @default 0 */
  defaultBearing?: number;
  /** Tilt in degrees. @default 0 */
  defaultPitch?: number;
  minZoom?: number;
  maxZoom?: number;
  /**
   * A MapLibre style (URL or object), or one per theme. openFreeMapStyles has OpenFreeMap's as published.
   * @default OpenFreeMap's Positron in the theme's colours, light or dark: no key, no usage limits
   */
  mapStyle?: MapStyle | { light: MapStyle; dark: MapStyle };
  /** @default the page's: dark inside `class="dark"` */
  theme?: "light" | "dark";
  /** Off: a still picture of the place, no panning or zooming. @default true */
  isInteractive?: boolean;
  /** Off: the mouse wheel scrolls the page past the map instead of zooming it. @default true */
  scrollZoom?: boolean;
  /** Once the first style has loaded, with the MapLibre map for anything the props do not cover. */
  onLoad?: (map: MapLibreMap) => void;
  /** After each move: drag, zoom, rotation or an animation, once it settles. */
  onViewChange?: (view: MapView) => void;
  /** A click on the map itself, not on a marker or a control. */
  onMapClick?: (lngLat: LngLat) => void;
  /** Texts of the controls, for other languages. */
  labels?: Partial<MapLabels>;
  /** Receives the MapLibre map once it exists. */
  mapRef?: React.Ref<MapLibreMap | null>;
  children?: React.ReactNode;
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<T>).current = value;
}

/** The style to load, a key to tell whether it changed, and whether it is the default one to recolour. */
function styleFor(mapStyle: MapProps["mapStyle"], theme: "light" | "dark") {
  if (mapStyle === undefined) return { style: openFreeMapStyles.positron as MapStyle, key: `cennge:${theme}`, tinted: true };
  const style = typeof mapStyle === "object" && "light" in mapStyle && "dark" in mapStyle ? mapStyle[theme] : (mapStyle as MapStyle);
  return { style, key: typeof style === "string" ? style : JSON.stringify(style), tinted: false };
}

/**
 * Loads a style in full: layers added by children are gone and come back on "style.load". The default
 * style is recoloured on the way in with the theme's tokens, read from around the map.
 */
function applyStyle(map: MapLibreMap, container: HTMLElement, resolved: ReturnType<typeof styleFor>, theme: "light" | "dark") {
  map.setStyle(resolved.style, {
    diff: false,
    transformStyle: resolved.tinted ? (_previous, next) => tintStyle(next, readPalette(container, theme)) : undefined,
  });
}

function viewOf(map: MapLibreMap): MapView {
  const { lng, lat } = map.getCenter();
  return { center: [lng, lat], zoom: map.getZoom(), bearing: map.getBearing(), pitch: map.getPitch() };
}

/**
 * Light or dark, from `class="dark"` around the map, and a counter that grows whenever a class or
 * `data-accent` changes anywhere: colours read from the theme's tokens are then read again.
 */
function useThemeSignal(node: HTMLElement | null, forced: "light" | "dark" | undefined) {
  const [signal, setSignal] = React.useState({ theme: forced ?? ("light" as "light" | "dark"), revision: 0 });
  React.useEffect(() => {
    if (!node) return;
    let frame = 0;
    const read = () => {
      const theme = forced ?? (node.closest(".dark") ? "dark" : "light");
      setSignal((current) => ({ theme, revision: current.revision + 1 }));
    };
    read();
    // Class changes come in bursts (a theme switch touches many elements): one read per frame.
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(read);
    });
    observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ["class", "data-accent"] });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [node, forced]);
  return signal;
}

/**
 * An interactive map: vector tiles drawn by MapLibre, with markers, popups, controls and routes as
 * children. maplibre-gl is an optional peer dependency, loaded only when a map mounts. On the server
 * and until it loads, the map's place is held at its size.
 */
export const Map = React.forwardRef<HTMLDivElement, MapProps>(function Map(props, forwardedRef) {
  const {
    defaultCenter = [0, 20],
    defaultZoom = 1.5,
    defaultBounds,
    boundsPadding = 48,
    defaultBearing = 0,
    defaultPitch = 0,
    minZoom,
    maxZoom,
    mapStyle,
    theme: themeProp,
    isInteractive = true,
    scrollZoom = true,
    onLoad,
    onViewChange,
    onMapClick,
    labels: labelsProp,
    mapRef,
    className,
    children,
    ...rest
  } = props;

  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [lib, setLib] = React.useState<MapLibreModule | null>(null);
  const [map, setMap] = React.useState<MapLibreMap | null>(null);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [styleRevision, setStyleRevision] = React.useState<number | null>(null);
  const styleCount = React.useRef(0);
  const { theme, revision: themeRevision } = useThemeSignal(container, themeProp);
  const labels = React.useMemo(() => ({ ...defaultMapLabels, ...labelsProp }), [labelsProp]);

  React.useImperativeHandle(forwardedRef, () => container as HTMLDivElement, [container]);
  // The style the map shows, so a theme read later that agrees with it does not load it again.
  const appliedStyle = React.useRef<string | null>(null);

  // The latest callbacks and options, read by listeners that are set up once.
  const latest = React.useRef({ onLoad, onViewChange, onMapClick, mapStyle, theme, labels });
  latest.current = { onLoad, onViewChange, onMapClick, mapStyle, theme, labels };
  const initial = React.useRef({
    defaultCenter,
    defaultZoom,
    defaultBounds,
    boundsPadding,
    defaultBearing,
    defaultPitch,
    minZoom,
    maxZoom,
    isInteractive,
    scrollZoom,
  });

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host || !container) return;
    let cancelled = false;
    let instance: MapLibreMap | null = null;
    loadMapLibre()
      .then((maplibre) => {
        if (cancelled) return;
        const options = initial.current;
        const startTheme = themeProp ?? (container.closest(".dark") ? "dark" : "light");
        const resolved = styleFor(latest.current.mapStyle, startTheme);
        appliedStyle.current = resolved.key;
        instance = new maplibre.Map({
          container: host,
          // The default style is loaded below, to recolour it on the way in.
          style: resolved.tinted ? undefined : resolved.style,
          center: options.defaultCenter,
          zoom: options.defaultZoom,
          bounds: options.defaultBounds,
          fitBoundsOptions: { padding: options.boundsPadding },
          bearing: options.defaultBearing,
          pitch: options.defaultPitch,
          minZoom: options.minZoom,
          maxZoom: options.maxZoom,
          interactive: options.isInteractive,
          scrollZoom: options.scrollZoom,
          attributionControl: false,
        });
        const created = instance;
        // One labelled region is the whole map (container); the canvas says how to use it.
        const canvas = created.getCanvas();
        canvas.removeAttribute("role");
        canvas.setAttribute("aria-label", latest.current.labels.canvas);
        created.on("style.load", () => setStyleRevision(++styleCount.current));
        if (resolved.tinted) applyStyle(created, container, resolved, startTheme);
        // OpenFreeMap's styles name a few icons their sprite lacks, and MapLibre warns about each. For
        // the default styles only, they become blank: a style of the app's own keeps its warnings.
        created.on("styleimagemissing", ({ id }: { id: string }) => {
          if (latest.current.mapStyle !== undefined || created.hasImage(id)) return;
          created.addImage(id, { width: 1, height: 1, data: new Uint8Array(4) });
        });
        created.once("load", () => {
          setStatus("ready");
          latest.current.onLoad?.(created);
        });
        created.on("moveend", () => latest.current.onViewChange?.(viewOf(created)));
        created.on("click", (event) => latest.current.onMapClick?.([event.lngLat.lng, event.lngLat.lat]));
        setLib(maplibre);
        setMap(created);
        setRef(mapRef, created);
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
      setRef(mapRef, null);
      setMap(null);
      instance?.remove();
    };
    // Created once per container. Later changes go through the effects below.
  }, [container]);

  // A new style (or the other theme's): layers added by children come back on "style.load".
  const resolvedStyle = styleFor(mapStyle, theme);
  React.useEffect(() => {
    if (!map || !container || appliedStyle.current === resolvedStyle.key) return;
    appliedStyle.current = resolvedStyle.key;
    setStyleRevision(null);
    applyStyle(map, container, resolvedStyle, theme);
  }, [map, resolvedStyle.key]);

  React.useEffect(() => {
    map?.getCanvas().setAttribute("aria-label", labels.canvas);
  }, [map, labels.canvas]);

  React.useEffect(() => {
    if (!map) return;
    if (scrollZoom) map.scrollZoom.enable();
    else map.scrollZoom.disable();
  }, [map, scrollZoom]);

  const context = React.useMemo<MapContextValue>(
    () => ({ map, lib, container, styleRevision, themeRevision, theme, labels }),
    [map, lib, container, styleRevision, themeRevision, theme, labels],
  );

  return (
    <div
      ref={setContainer}
      role="region"
      {...rest}
      data-slot="map"
      data-state={status}
      className={cn(
        "relative isolate h-80 w-full overflow-hidden rounded-large border border-border bg-surface-2",
        // The ring of the focused map. The canvas sits inside the clipped area, so the frame draws it.
        "outline-none has-[canvas:focus-visible]:outline-2 has-[canvas:focus-visible]:outline-offset-2",
        "has-[canvas:focus-visible]:outline-solid has-[canvas:focus-visible]:outline-ring",
        className,
      )}
    >
      <div
        ref={hostRef}
        className={cn(
          "absolute inset-0",
          // What MapLibre's own stylesheet would set, for the parts of it we use.
          "[&_.maplibregl-canvas]:absolute [&_.maplibregl-canvas]:top-0 [&_.maplibregl-canvas]:left-0",
          "[&_.maplibregl-canvas]:outline-none",
          "[&_.maplibregl-canvas-container.maplibregl-interactive]:cursor-grab",
          "[&_.maplibregl-canvas-container.maplibregl-interactive:active]:cursor-grabbing",
          "[&_.maplibregl-boxzoom]:absolute [&_.maplibregl-boxzoom]:top-0 [&_.maplibregl-boxzoom]:left-0",
          "[&_.maplibregl-boxzoom]:border-2 [&_.maplibregl-boxzoom]:border-dashed [&_.maplibregl-boxzoom]:border-primary",
          "[&_.maplibregl-boxzoom]:bg-primary-bg",
          status === "ready" ? "opacity-100" : "opacity-0",
          "transition-opacity duration-300 motion-reduce:transition-none",
        )}
      />
      {status === "loading" ? (
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 overflow-hidden bg-surface-3",
            "after:absolute after:inset-0 after:animate-cennge-shimmer after:content-[''] motion-reduce:after:animate-none",
          )}
        />
      ) : null}
      {status === "error" ? (
        <div role="alert" className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-muted">
          {labels.loadError}
        </div>
      ) : null}
      <MapContext.Provider value={context}>
        {/* Overlays: markers, popups and controls take pointer events themselves. */}
        {map ? <div className="pointer-events-none absolute inset-0">{children}</div> : null}
        {map ? <MapAttribution /> : null}
      </MapContext.Provider>
    </div>
  );
});
