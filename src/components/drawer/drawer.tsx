import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { capture } from "../../utils/capture";
import { tv } from "../../utils/tv";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  useFocusReturn,
  useIsModalDialog,
  withinBackdrop,
  type DialogProps,
} from "../dialog/dialog";

/* A drawer is a dialog anchored to an edge: same focus trap, Escape and scroll lock. */
export const Drawer = Dialog;
export type DrawerProps = DialogProps;
export const DrawerTrigger = DialogTrigger;
export const DrawerClose = DialogClose;
export const DrawerHeader = DialogHeader;
export const DrawerTitle = DialogTitle;
export const DrawerDescription = DialogDescription;
export const DrawerBody = DialogBody;
export const DrawerFooter = DialogFooter;

export type DrawerPlacement = "left" | "right" | "top" | "bottom";

const drawer = tv({
  slots: {
    // As the dialog's: the backdrop is the overlay's ::before (see dialogStyles).
    overlay: [
      "fixed inset-0 z-50",
      "before:absolute before:inset-0 before:bg-black/55 before:backdrop-blur-[2px]",
      "data-[state=open]:before:animate-cennge-fade-in data-[state=closed]:animate-cennge-backdrop-out",
      "motion-reduce:animate-none motion-reduce:before:animate-none",
    ],
    content: [
      "fixed z-50 flex flex-col border-border bg-surface-2 pb-6 text-foreground shadow-floating outline-none",
      "data-[state=open]:animate-cennge-slide-in data-[state=closed]:animate-cennge-slide-out motion-reduce:animate-none",
    ],
    closeButton: [
      "absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-full text-muted",
      "transition-colors hover:bg-default-bg hover:text-foreground",
      "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring",
    ],
    // The strip a finger drags the sheet by: wider and taller than the bar drawn in it.
    grip: "flex min-h-11 w-full shrink-0 touch-none items-center justify-center select-none data-[draggable]:cursor-grab data-[dragging]:cursor-grabbing",
    handle: [
      "h-1.5 w-12 rounded-full bg-default-highlight forced-colors:bg-[CanvasText]",
      // As a button (with snap points): a bigger target than it looks, and a visible focus.
      "relative cursor-pointer outline-none before:absolute before:-inset-x-4 before:-inset-y-3 before:content-['']",
      "transition-colors hover:bg-default-500/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-solid focus-visible:outline-ring",
    ],
  },
  variants: {
    placement: {
      right: { content: "inset-y-0 right-0 h-full w-full border-l [--cennge-slide-x:100%] sm:rounded-l-large" },
      left: { content: "inset-y-0 left-0 h-full w-full border-r [--cennge-slide-x:-100%] sm:rounded-r-large" },
      top: { content: "inset-x-0 top-0 max-h-[85dvh] border-b [--cennge-slide-y:-100%] rounded-b-large" },
      bottom: {
        content: "inset-x-0 bottom-0 max-h-[85dvh] border-t pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] [--cennge-slide-y:100%] rounded-t-large",
      },
    },
    size: { sm: {}, md: {}, lg: {} },
  },
  compoundVariants: [
    { placement: ["left", "right"], size: "sm", class: { content: "max-w-xs" } },
    { placement: ["left", "right"], size: "md", class: { content: "max-w-md" } },
    { placement: ["left", "right"], size: "lg", class: { content: "max-w-2xl" } },
  ],
});

type DrawerSlots = "overlay" | "content" | "closeButton" | "handle";

export interface DrawerLabels {
  /** The handle of a sheet with snap points, when it would make the sheet taller. */
  expand: string;
  /** The handle at the tallest snap point, where it brings the sheet back to the lowest. */
  collapse: string;
}

export const defaultDrawerLabels: DrawerLabels = { expand: "Expand", collapse: "Collapse" };

export interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default "right" */
  placement?: DrawerPlacement;
  /** Width for left/right drawers. @default "md" */
  size?: "sm" | "md" | "lg";
  /** @default false */
  hideCloseButton?: boolean;
  /**
   * Bottom only: heights the sheet rests at, as shares of the screen's height, lowest first, e.g.
   * `[0.4, 0.9]`. The handle becomes a button that steps through them; a drag settles on the nearest.
   */
  snapPoints?: readonly number[];
  /** Bottom only: the snap point it rests at, by index (controlled). */
  snapPoint?: number;
  /** Bottom only: the snap point it opens at. @default 0 */
  defaultSnapPoint?: number;
  onSnapPointChange?: (index: number) => void;
  /** Bottom only: drag the handle down to close, and between snap points. @default true */
  isDraggable?: boolean;
  labels?: Partial<DrawerLabels>;
  classNames?: Partial<Record<DrawerSlots, string>>;
  container?: HTMLElement | null;
  /** Runs as the drawer opens and moves focus inside; `event.preventDefault()` to focus something else. */
  onOpenAutoFocus?: (event: Event) => void;
  /** Runs as the drawer closes and returns focus; `event.preventDefault()` to send focus elsewhere. */
  onCloseAutoFocus?: (event: Event) => void;
}

interface Drag {
  pointer: number;
  startY: number;
  /** The last two moves, for the speed at release. */
  last: { y: number; t: number };
  previous: { y: number; t: number };
  offset: number;
  /** Past the first few pixels: a drag, no longer a press. */
  isMoving: boolean;
}

/** A fling faster than this, in pixels per millisecond, closes the sheet or moves it a snap point. */
const FLING = 0.6;

export const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(function DrawerContent(
  {
    placement = "right",
    size = "md",
    hideCloseButton = false,
    snapPoints,
    snapPoint,
    defaultSnapPoint = 0,
    onSnapPointChange,
    isDraggable = true,
    labels: labelsProp,
    classNames,
    className,
    style,
    container,
    onOpenAutoFocus,
    onCloseAutoFocus,
    children,
    ...rest
  },
  forwardedRef,
) {
  const slots = drawer({ placement, size });
  const focusReturn = useFocusReturn((event) => openAutoFocus(event), onCloseAutoFocus);
  const isModal = useIsModalDialog();
  const labels = { ...defaultDrawerLabels, ...labelsProp };
  const contentRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => contentRef.current as HTMLDivElement);
  const closeRef = React.useRef<HTMLButtonElement>(null);

  const isSheet = placement === "bottom";
  const snaps = isSheet && snapPoints?.length ? [...snapPoints].map((point) => Math.min(1, Math.max(0.05, point))).sort((a, b) => a - b) : null;
  const [ownSnap, setOwnSnap] = React.useState(defaultSnapPoint);
  const current = Math.min(Math.max(0, snapPoint ?? ownSnap), (snaps?.length ?? 1) - 1);
  const setSnap = (index: number) => {
    if (index === current) return;
    if (snapPoint === undefined) setOwnSnap(index);
    onSnapPointChange?.(index);
  };

  const drag = React.useRef<Drag | null>(null);
  const [isDragging, setDragging] = React.useState(false);
  const canDrag = isSheet && isDraggable;
  /** The sheet's height at a snap point, as written to its style. */
  const heightAt = (index: number) => `${snaps![index]! * 100}dvh`;

  /** Follows the finger by writing the style directly: no render per move, so a long list inside stays smooth. */
  const follow = (offset: number) => {
    const sheet = contentRef.current;
    if (!sheet) return;
    if (snaps && offset < 0) {
      // Up: the sheet grows, to the tallest snap point and a little past it, resisting.
      const top = snaps[snaps.length - 1]! * window.innerHeight;
      const grown = Math.min(snaps[current]! * window.innerHeight - offset, top + Math.max(0, snaps[current]! * window.innerHeight - offset - top) / 4);
      sheet.style.height = `${grown}px`;
      sheet.style.transform = "";
    } else {
      // Down (or up with no snap points, resisting): the sheet moves.
      sheet.style.transform = `translateY(${offset < 0 ? offset / 4 : offset}px)`;
      if (snaps) sheet.style.height = heightAt(current);
    }
  };
  /** Back to rest at a snap point, a frame later: once the transition is on again, so it settles smoothly. */
  const reset = (index: number) =>
    requestAnimationFrame(() => {
      const sheet = contentRef.current;
      if (!sheet) return;
      sheet.style.transform = "";
      if (snaps) sheet.style.height = heightAt(index);
    });

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // One finger drags; a second one is ignored until the first lets go.
    if (!canDrag || event.button !== 0 || drag.current) return;
    const now = { y: event.clientY, t: event.timeStamp };
    drag.current = { pointer: event.pointerId, startY: event.clientY, last: now, previous: now, offset: 0, isMoving: false };
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || state.pointer !== event.pointerId) return;
    state.offset = event.clientY - state.startY;
    state.previous = state.last;
    state.last = { y: event.clientY, t: event.timeStamp };
    if (!state.isMoving) {
      if (Math.abs(state.offset) <= 3) return;
      state.isMoving = true;
      // Captured once it moves, not on the press: a tap on the handle stays a click on the handle.
      capture(event);
      setDragging(true);
    }
    follow(state.offset);
  };
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || state.pointer !== event.pointerId) return;
    drag.current = null;
    if (!state.isMoving) return;
    setDragging(false);
    // A finger that stopped before it let go has no speed: only a move in the last 100ms flings.
    const elapsed = state.last.t - state.previous.t;
    const isRecent = event.timeStamp - state.last.t < 100;
    const speed = elapsed > 0 && isRecent ? (state.last.y - state.previous.y) / elapsed : 0;
    const viewport = window.innerHeight;
    const close = () => closeRef.current?.click();
    if (!snaps) {
      const height = contentRef.current?.offsetHeight ?? viewport;
      // Closing from where it was let go: the slide out starts there.
      if (speed > FLING || state.offset > height * 0.35) return close();
      reset(current);
      return;
    }
    const shown = snaps[current]! * viewport - state.offset;
    if ((speed > FLING && current === 0) || shown < snaps[0]! * viewport * 0.6) return close();
    let next: number;
    if (Math.abs(speed) > FLING) next = Math.min(snaps.length - 1, Math.max(0, current + (speed > 0 ? -1 : 1)));
    else next = snaps.reduce((best, point, i) => (Math.abs(point * viewport - shown) < Math.abs(snaps[best]! * viewport - shown) ? i : best), 0);
    reset(next);
    if (next !== current) setSnap(next);
  };
  const onPointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointer !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    reset(current);
  };

  const sheetStyle: React.CSSProperties | undefined = snaps ? { height: heightAt(current), maxHeight: "none" } : undefined;

  // With snap points the handle is a button, and so the first thing to take focus: opening, it is skipped
  // for what the sheet holds.
  const openAutoFocus = (event: Event) => {
    onOpenAutoFocus?.(event);
    if (event.defaultPrevented || !snaps || snaps.length < 2) return;
    event.preventDefault();
    const sheet = contentRef.current;
    const first = sheet?.querySelector<HTMLElement>(
      'button:not([data-slot="drawer-handle"]):not([hidden]):not([disabled]), [href], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    (first ?? sheet)?.focus();
  };

  const isTop = !snaps || current === snaps.length - 1;
  const grip = isSheet ? (
    <div
      data-slot="drawer-grip"
      data-draggable={canDrag ? "" : undefined}
      data-dragging={isDragging ? "" : undefined}
      className={slots.grip()}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {snaps && snaps.length > 1 ? (
        <button
          type="button"
          data-slot="drawer-handle"
          aria-label={isTop ? labels.collapse : labels.expand}
          className={slots.handle({ class: classNames?.handle })}
          onClick={() => setSnap(isTop ? 0 : current + 1)}
          onKeyDown={(event) => {
            const step = event.key === "ArrowUp" ? 1 : event.key === "ArrowDown" ? -1 : 0;
            if (!step) return;
            event.preventDefault();
            const next = Math.min(snaps.length - 1, Math.max(0, current + step));
            if (next !== current) setSnap(next);
          }}
        />
      ) : (
        <div aria-hidden="true" data-slot="drawer-handle" className="h-1.5 w-12 rounded-full bg-default-highlight forced-colors:bg-[CanvasText]" />
      )}
    </div>
  ) : null;

  return (
    <DialogPrimitive.Portal container={container}>
      {withinBackdrop(
        isModal,
        <DialogPrimitive.Overlay className={slots.overlay({ class: classNames?.overlay })} />,
        <DialogPrimitive.Content
          ref={contentRef}
          {...focusReturn}
          data-snap-point={snaps ? current : undefined}
          className={slots.content({
            class: [
              // Settles with the tactile ease after a drag or a step; follows the finger while dragging.
              isSheet && !isDragging && "transition-[height,transform] duration-300 ease-tactile motion-reduce:transition-none",
              classNames?.content,
              className,
            ],
          })}
          style={{ ...sheetStyle, ...style }}
          {...rest}
        >
          {grip}
          {children}
          {/* Closes the sheet after a drag down, through the dialog's own close. */}
          {isSheet ? <DialogPrimitive.Close ref={closeRef} hidden tabIndex={-1} aria-hidden="true" /> : null}
          {hideCloseButton ? null : (
            <DialogPrimitive.Close aria-label="Close" className={slots.closeButton({ class: classNames?.closeButton })}>
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>,
      )}
    </DialogPrimitive.Portal>
  );
});
