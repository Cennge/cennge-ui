import * as React from "react";
import { useMapContext, type LngLat } from "./context";
import { PopupCard, useAnchor } from "./overlay";

export interface MapPopupProps {
  /** The point the popup's arrow shows. */
  lngLat: LngLat;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Its name for screen readers. */
  label: string;
  /** Focus moves into the popup when it opens, e.g. when opened from the keyboard. @default false */
  autoFocus?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * A popup at any point, not tied to a marker: what was clicked on the map, a search result. Escape and
 * its close button close it; clicks on the map are left to `onMapClick`, e.g. to move it there.
 */
export function MapPopup({ lngLat, isOpen, onOpenChange, label, autoFocus = false, className, children }: MapPopupProps) {
  const { map, container, labels } = useMapContext("MapPopup");
  const rootRef = React.useRef<HTMLDivElement>(null);
  useAnchor(map!, lngLat, rootRef);
  const close = React.useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <div ref={rootRef} data-slot="map-popup-anchor" className="pointer-events-none absolute top-0 left-0" style={{ zIndex: 4 }}>
      {isOpen && container ? (
        <PopupCard
          // A new point is a new popup: it pans into view again.
          key={`${lngLat[0]},${lngLat[1]}`}
          map={map!}
          container={container}
          label={label}
          closeLabel={labels.close}
          onClose={close}
          autoFocus={autoFocus}
          // Clicks on the map are the page's to handle, e.g. to move the popup there.
          closeOnMapClick={false}
          className={className}
        >
          {children}
        </PopupCard>
      ) : null}
    </div>
  );
}
