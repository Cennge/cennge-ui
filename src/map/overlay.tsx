import * as React from "react";
import { cn } from "../utils/cn";
import type { LngLat } from "./context";
import { prefersReducedMotion, type MapLibreMap } from "./maplibre";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/**
 * Keeps an element at a point of the map as it moves: its transform is written on every frame of the
 * move, straight to the DOM, without a React render.
 */
export function useAnchor(map: MapLibreMap, lngLat: LngLat, ref: React.RefObject<HTMLElement | null>) {
  const [lng, lat] = lngLat;
  useIsomorphicLayoutEffect(() => {
    const place = () => {
      const node = ref.current;
      if (!node) return;
      const { x, y } = map.project([lng, lat]);
      // Whole pixels: text in a marker or popup stays sharp.
      node.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    };
    place();
    map.on("move", place);
    map.on("resize", place);
    return () => {
      map.off("move", place);
      map.off("resize", place);
    };
  }, [map, lng, lat]);
}

interface PopupCardProps {
  map: MapLibreMap;
  container: HTMLDivElement;
  label: string;
  closeLabel: string;
  onClose: () => void;
  /** Moves focus into the card when it opens. */
  autoFocus: boolean;
  /** Closes on a click on the map, outside any marker. */
  closeOnMapClick: boolean;
  className?: string;
  children: React.ReactNode;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

/**
 * A card above a point, with an arrow down to it. On opening the map pans just enough to show all of
 * it. A non-modal dialog: Escape and the close button dismiss it; the map stays usable.
 */
export function PopupCard(props: PopupCardProps) {
  const { map, container, label, closeLabel, onClose, autoFocus, closeOnMapClick, className, children } = props;
  const cardRef = React.useRef<HTMLDivElement>(null);

  // After the layout effects: a popup mounted with its anchor (MapPopup) is only at its point once the
  // anchor's effect, which runs after this child's layout effects, has placed it.
  React.useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const margin = 12;
    // The card grows from its arrow: its bottom and middle are where they will stay, its size is the
    // size it grows to. The rectangle the browser reports is the first frame's, slightly smaller.
    const rect = card.getBoundingClientRect();
    const middle = rect.left + rect.width / 2;
    const box = {
      left: middle - card.offsetWidth / 2,
      right: middle + card.offsetWidth / 2,
      top: rect.bottom - card.offsetHeight,
      bottom: rect.bottom,
    };
    const frame = container.getBoundingClientRect();
    let dx = 0;
    let dy = 0;
    if (box.top < frame.top + margin) dy = box.top - frame.top - margin;
    else if (box.bottom > frame.bottom - margin) dy = box.bottom - frame.bottom + margin;
    if (box.left < frame.left + margin) dx = box.left - frame.left - margin;
    else if (box.right > frame.right - margin) dx = box.right - frame.right + margin;
    if (dx || dy) map.panBy([dx, dy], { animate: !prefersReducedMotion(container) });
    if (autoFocus) card.focus({ preventScroll: true });
  }, []);

  React.useEffect(() => {
    if (!closeOnMapClick) return;
    const close = () => onClose();
    map.on("click", close);
    return () => {
      map.off("click", close);
    };
  }, [map, onClose, closeOnMapClick]);

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
      data-slot="map-popup"
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.stopPropagation();
        onClose();
      }}
      className={cn(
        "pointer-events-auto absolute bottom-full left-1/2 mb-3 w-max max-w-72 -translate-x-1/2 cursor-auto",
        "rounded-large border border-border bg-surface-3 p-3 pr-10 text-sm text-foreground shadow-floating",
        "origin-bottom animate-cennge-pop-in motion-reduce:animate-none",
        "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring",
        className,
      )}
    >
      {children}
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className={cn(
          "absolute top-2 right-2 flex size-7 cursor-pointer items-center justify-center rounded-full text-muted",
          "transition-colors hover:bg-default-bg hover:text-foreground",
          "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring",
        )}
      >
        <CloseIcon />
      </button>
      {/* The arrow: a corner of a turned square, in the card's colours. */}
      <span
        aria-hidden="true"
        className="absolute top-full left-1/2 -mt-[7px] size-3 -translate-x-1/2 rotate-45 border-r border-b border-border bg-surface-3"
      />
    </div>
  );
}
