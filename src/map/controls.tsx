import * as React from "react";
import { Tooltip } from "../components/tooltip";
import { cn } from "../utils/cn";
import { tv } from "../utils/tv";
import { useMapContext, type LngLat } from "./context";
import { prefersReducedMotion } from "./maplibre";
import { useAnchor } from "./overlay";

const controls = tv({
  slots: {
    root: "pointer-events-none absolute z-[6] flex flex-col gap-2 p-2.5",
    group: "pointer-events-auto flex flex-col rounded-medium border border-border bg-surface-3 shadow-raised",
    button: [
      "relative flex size-9 cursor-pointer items-center justify-center text-foreground",
      "transition-colors hover:bg-default-bg disabled:cursor-default disabled:text-muted disabled:hover:bg-transparent",
      // Each button rounds its own corners: the group does not clip, so focus rings stay whole.
      "first:rounded-t-[calc(var(--radius-medium)-1px)] last:rounded-b-[calc(var(--radius-medium)-1px)]",
      "not-first:border-t not-first:border-border",
      "outline-none focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring",
    ],
  },
  variants: {
    position: {
      "top-left": { root: "top-0 left-0" },
      "top-right": { root: "top-0 right-0" },
      "bottom-left": { root: "bottom-6 left-0" },
      "bottom-right": { root: "right-0 bottom-6" },
    },
  },
});

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-[18px]", className)} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const icons = {
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  // Concentric rings with a centre dot: "here".
  locate: "M12 3v3M12 18v3M3 12h3M18 12h3M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z",
  expand: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
  shrink: "M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5",
};

function CompassIcon({ needleRef }: { needleRef: React.Ref<SVGGElement> }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <g ref={needleRef} style={{ transformOrigin: "12px 12px" }}>
        <path d="M12 3 15 12H9Z" className="fill-danger" />
        <path d="M12 21 9 12h6Z" className="fill-muted" />
      </g>
    </svg>
  );
}

/** The dot where the user is, with a slow ring around it. */
function UserLocation({ lngLat, label }: { lngLat: LngLat; label: string }) {
  const { map } = useMapContext("MapControls");
  const ref = React.useRef<HTMLDivElement>(null);
  useAnchor(map!, lngLat, ref);
  return (
    <div ref={ref} className="pointer-events-none absolute top-0 left-0" style={{ zIndex: 1 }}>
      <span role="img" aria-label={label} className="relative block size-4 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inset-0 animate-ping rounded-full bg-info opacity-60 motion-reduce:hidden" />
        <span className="absolute inset-0 rounded-full bg-info shadow-raised ring-[3px] ring-white dark:ring-surface-1" />
      </span>
    </div>
  );
}

export interface MapControlsProps {
  /** @default "top-right" */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  /** @default true */
  showZoom?: boolean;
  /** Turns the map back to north; its needle shows the rotation. @default true */
  showCompass?: boolean;
  /** Finds the user (the browser asks first) and shows them on the map. @default false */
  showLocate?: boolean;
  /** @default false */
  showFullscreen?: boolean;
  className?: string;
}

/** Buttons over the map: zoom, north, the user's location, full screen. Each has a tooltip and a name. */
export function MapControls({
  position = "top-right",
  showZoom = true,
  showCompass = true,
  showLocate = false,
  showFullscreen = false,
  className,
}: MapControlsProps) {
  const { map: mapOrNull, container, labels } = useMapContext("MapControls");
  const map = mapOrNull!;
  const slots = controls({ position });
  const tooltipSide = position.endsWith("right") ? "left" : "right";
  const animate = () => !prefersReducedMotion(container);

  const [zoom, setZoom] = React.useState(() => map.getZoom());
  React.useEffect(() => {
    const update = () => setZoom(map.getZoom());
    map.on("zoomend", update);
    return () => {
      map.off("zoomend", update);
    };
  }, [map]);

  // The needle turns with the map, straight in the DOM.
  const needleRef = React.useRef<SVGGElement>(null);
  React.useEffect(() => {
    const turn = () => {
      if (needleRef.current) needleRef.current.style.transform = `rotate(${-map.getBearing()}deg)`;
    };
    turn();
    map.on("rotate", turn);
    return () => {
      map.off("rotate", turn);
    };
  }, [map]);

  const [location, setLocation] = React.useState<LngLat | null>(null);
  const [locating, setLocating] = React.useState<"idle" | "busy" | "failed">("idle");
  const locate = () => {
    if (!("geolocation" in navigator)) {
      setLocating("failed");
      return;
    }
    setLocating("busy");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const here: LngLat = [coords.longitude, coords.latitude];
        setLocation(here);
        setLocating("idle");
        map.flyTo({ center: here, zoom: Math.max(map.getZoom(), 14), animate: animate() });
      },
      () => setLocating("failed"),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const [isFullscreen, setFullscreen] = React.useState(false);
  const canFullscreen = typeof document !== "undefined" && Boolean(document.fullscreenEnabled);
  React.useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === container);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, [container]);

  const button = (label: string, content: React.ReactNode, props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <Tooltip content={label} placement={tooltipSide}>
      <button type="button" aria-label={label} className={slots.button()} {...props}>
        {content}
      </button>
    </Tooltip>
  );

  return (
    <>
      <div data-slot="map-controls" className={slots.root({ class: className })}>
        {showZoom ? (
          <div className={slots.group()}>
            {button(labels.zoomIn, <Icon d={icons.plus} />, {
              disabled: zoom >= map.getMaxZoom(),
              onClick: () => map.zoomIn({ animate: animate() }),
            })}
            {button(labels.zoomOut, <Icon d={icons.minus} />, {
              disabled: zoom <= map.getMinZoom(),
              onClick: () => map.zoomOut({ animate: animate() }),
            })}
          </div>
        ) : null}
        {showCompass ? (
          <div className={slots.group()}>
            {button(labels.resetNorth, <CompassIcon needleRef={needleRef} />, {
              onClick: () => map.resetNorthPitch({ animate: animate() }),
            })}
          </div>
        ) : null}
        {showLocate ? (
          <div className={slots.group()}>
            {button(
              locating === "failed" ? labels.locationUnavailable : labels.locate,
              <Icon d={icons.locate} className={cn(locating === "busy" && "animate-pulse", locating === "failed" && "text-danger")} />,
              { onClick: locate, "aria-busy": locating === "busy" || undefined },
            )}
          </div>
        ) : null}
        {showFullscreen && canFullscreen ? (
          <div className={slots.group()}>
            {button(isFullscreen ? labels.exitFullscreen : labels.enterFullscreen, <Icon d={isFullscreen ? icons.shrink : icons.expand} />, {
              "aria-pressed": isFullscreen,
              onClick: () => (isFullscreen ? document.exitFullscreen() : container?.requestFullscreen()),
            })}
          </div>
        ) : null}
        {/* Says that locating failed: the button's new name alone is not announced. */}
        <span className="sr-only" role="status">
          {locating === "failed" ? labels.locationUnavailable : ""}
        </span>
      </div>
      {location ? <UserLocation lngLat={location} label={labels.yourLocation} /> : null}
    </>
  );
}
