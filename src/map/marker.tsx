import * as React from "react";
import { tv } from "../utils/tv";
import { useId } from "../utils/use-id";
import type { CenngeColor, CenngeSize } from "../types";
import { useMapContext, type LngLat } from "./context";
import { PopupCard, useAnchor } from "./overlay";

const marker = tv({
  slots: {
    // Placed at the point by useAnchor; everything inside is laid out around that point.
    root: "pointer-events-none absolute top-0 left-0",
    body: "relative -translate-x-1/2",
    trigger: [
      "pointer-events-auto flex items-center justify-center rounded-full",
      "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring",
    ],
    dot: [
      "block rounded-full shadow-raised ring-white transition-transform duration-150 motion-reduce:transition-none",
      "dark:ring-surface-1",
    ],
    tooltip: [
      "pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap",
      "rounded-small border border-border bg-surface-4 px-2 py-1 text-xs font-medium text-foreground shadow-floating",
      "transition-opacity duration-150 motion-reduce:transition-none",
    ],
  },
  variants: {
    anchor: {
      center: { body: "-translate-y-1/2" },
      bottom: { body: "-translate-y-full" },
    },
    interactive: {
      true: { trigger: "cursor-pointer", dot: "group-hover/marker:scale-115" },
      false: {},
    },
    size: {
      // A 24px target at the least (WCAG 2.5.8), around a smaller dot.
      sm: { trigger: "min-h-6 min-w-6", dot: "size-3 ring-2" },
      md: { trigger: "min-h-6 min-w-6", dot: "size-4 ring-[3px]" },
      lg: { trigger: "min-h-8 min-w-8", dot: "size-5 ring-[3px]" },
    },
    color: {
      default: { dot: "bg-default-500" },
      primary: { dot: "bg-primary" },
      secondary: { dot: "bg-secondary" },
      success: { dot: "bg-success" },
      warning: { dot: "bg-warning" },
      danger: { dot: "bg-danger" },
      info: { dot: "bg-info" },
    },
  },
  defaultVariants: { anchor: "center", interactive: false, size: "md", color: "primary" },
});

export interface MapMarkerProps {
  lngLat: LngLat;
  /** What the marker stands for: read by screen readers, and the title of its popup. */
  label: string;
  /** Shown on hover and keyboard focus. */
  tooltip?: React.ReactNode;
  /** Opens on click, Enter or Space, above the marker. */
  popup?: React.ReactNode;
  isPopupOpen?: boolean;
  defaultPopupOpen?: boolean;
  onPopupOpenChange?: (isOpen: boolean) => void;
  /** Makes the marker a button even without a popup. */
  onClick?: () => void;
  /** Of the default dot. @default "primary" */
  color?: CenngeColor;
  /** Of the default dot. @default "md" */
  size?: CenngeSize;
  /** Which part of the marker is on the point: its middle, or its bottom (a pin). @default "center" */
  anchor?: "center" | "bottom";
  /** Your own marker in place of the dot: an avatar, a price, an icon. */
  children?: React.ReactNode;
  className?: string;
}

/** A point on the map. With a popup or an onClick it is a button, in the tab order like any other. */
export function MapMarker(props: MapMarkerProps) {
  const {
    lngLat,
    label,
    tooltip,
    popup,
    isPopupOpen: isPopupOpenProp,
    defaultPopupOpen = false,
    onPopupOpenChange,
    onClick,
    color,
    size,
    anchor,
    children,
    className,
  } = props;
  const { map, container, labels } = useMapContext("MapMarker");
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const tooltipId = useId();
  const [innerOpen, setInnerOpen] = React.useState(defaultPopupOpen);
  const isOpen = popup !== undefined && (isPopupOpenProp ?? innerOpen);
  const [isPointed, setPointed] = React.useState(false);
  const [isFocused, setFocused] = React.useState(false);
  // Focus goes into a popup opened from here; this records how it opened.
  const openedByUser = React.useRef(false);

  useAnchor(map!, lngLat, rootRef);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (isPopupOpenProp === undefined) setInnerOpen(next);
      onPopupOpenChange?.(next);
    },
    [isPopupOpenProp, onPopupOpenChange],
  );
  const close = React.useCallback(() => {
    // Focus left in the popup goes back to the marker; a click elsewhere keeps it where it went.
    const hadFocus = rootRef.current?.contains(document.activeElement);
    openedByUser.current = false;
    setOpen(false);
    if (hadFocus) triggerRef.current?.focus({ preventScroll: true });
  }, [setOpen]);

  const isInteractive = popup !== undefined || onClick !== undefined;
  const slots = marker({ anchor, size, color, interactive: isInteractive });
  const showTooltip = tooltip !== undefined && (isPointed || isFocused) && !isOpen;
  const visual = children ?? <span className={slots.dot()} />;

  return (
    <div
      ref={rootRef}
      data-slot="map-marker"
      data-open={isOpen || undefined}
      className={slots.root({ class: className })}
      // The marker in use is drawn above its neighbours, with its tooltip and popup.
      style={{ zIndex: isOpen ? 3 : isPointed || isFocused ? 2 : 1 }}
    >
      <div className={slots.body()}>
        {isInteractive ? (
          <button
            ref={triggerRef}
            type="button"
            aria-label={label}
            aria-describedby={tooltip !== undefined ? tooltipId : undefined}
            aria-haspopup={popup !== undefined ? "dialog" : undefined}
            aria-expanded={popup !== undefined ? isOpen : undefined}
            onClick={() => {
              onClick?.();
              if (popup === undefined) return;
              openedByUser.current = true;
              setOpen(!isOpen);
            }}
            onPointerEnter={() => setPointed(true)}
            onPointerLeave={() => setPointed(false)}
            onFocus={(event) => setFocused(event.currentTarget.matches(":focus-visible"))}
            onBlur={() => setFocused(false)}
            className={slots.trigger({ class: "group/marker" })}
          >
            {visual}
          </button>
        ) : (
          <span
            role="img"
            aria-label={label}
            aria-describedby={tooltip !== undefined ? tooltipId : undefined}
            onPointerEnter={() => setPointed(true)}
            onPointerLeave={() => setPointed(false)}
            className={slots.trigger()}
          >
            {visual}
          </span>
        )}
        {tooltip !== undefined ? (
          <span id={tooltipId} role="tooltip" className={slots.tooltip({ class: showTooltip ? "opacity-100" : "invisible opacity-0" })}>
            {tooltip}
          </span>
        ) : null}
        {isOpen && container ? (
          <PopupCard
            map={map!}
            container={container}
            label={label}
            closeLabel={labels.close}
            onClose={close}
            autoFocus={openedByUser.current}
            closeOnMapClick
          >
            {popup}
          </PopupCard>
        ) : null}
      </div>
    </div>
  );
}
