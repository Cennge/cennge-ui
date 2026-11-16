import * as React from "react";
import { capture } from "../../utils/capture";
import { cn } from "../../utils/cn";
import { tv } from "../../utils/tv";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "../dropdown/dropdown";
import type { CenngeColor } from "../../types";

export interface SwipeAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  /** @default "default" */
  color?: CenngeColor;
  isDisabled?: boolean;
  onAction: () => void;
}

export type SwipeActionsSide = "leading" | "trailing";

export interface SwipeActionsLabels {
  /** Names the button that lists the actions, for screen readers: given the row's `label`. */
  menu: (label: string) => string;
}

export const defaultSwipeActionsLabels: SwipeActionsLabels = { menu: (label) => `Actions for ${label}` };

const swipe = tv({
  slots: {
    // Clips only while the row is moved: at rest a focus ring on the row shows whole.
    base: "relative isolate data-[moved]:overflow-hidden",
    actions: "absolute inset-y-0 flex items-stretch",
    action: [
      "flex min-w-18 cursor-pointer flex-col items-center justify-center gap-1 px-3 text-xs font-semibold outline-none [&_svg]:size-5",
      "transition-[filter] duration-(--cennge-duration-fast)",
      "focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-solid focus-visible:outline-current",
      "disabled:cursor-not-allowed disabled:opacity-(--cennge-disabled-opacity)",
      // The action a full swipe runs: it fills the gap, and brightens once letting go would run it.
      "data-[edge]:flex-1 data-[armed]:brightness-125",
    ],
    row: [
      "relative z-10 flex items-center bg-surface-1 touch-pan-y",
      "data-[settling]:transition-transform data-[settling]:duration-300 data-[settling]:ease-tactile motion-reduce:transition-none",
    ],
    content: "min-w-0 flex-1",
    menu: [
      "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted outline-none",
      "transition-colors hover:bg-default-500/10 hover:text-foreground",
      "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring",
      "disabled:cursor-not-allowed disabled:opacity-(--cennge-disabled-opacity)",
    ],
  },
});

const actionColor: Record<CenngeColor, string> = {
  default: "bg-default text-default-foreground",
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-danger text-danger-foreground",
  info: "bg-info text-info-foreground",
};

export interface SwipeActionsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The row's name, for the actions button: "Oatmeal, 320 kcal". */
  label: string;
  /** Revealed by a swipe to the right; a full swipe runs the first. */
  leadingActions?: readonly SwipeAction[];
  /** Revealed by a swipe to the left; a full swipe runs the last, at the edge (put a delete there). */
  trailingActions?: readonly SwipeAction[];
  /** The side that is open (controlled); `null` when closed. */
  isOpen?: SwipeActionsSide | null;
  onOpenChange?: (side: SwipeActionsSide | null) => void;
  /** No swipe and no menu, while the row is saving, say. */
  isDisabled?: boolean;
  /**
   * The button at the end of the row that lists every action in a menu: the way to them without a swipe,
   * by mouse, keyboard or screen reader. Hide it only if the row offers the actions some other way.
   * @default true
   */
  showMenu?: boolean;
  /** The menu button's icon. @default three dots */
  menuIcon?: React.ReactNode;
  labels?: Partial<SwipeActionsLabels>;
  /** The row. Give it its own background if the list's is not the page's (`classNames.row`). */
  children: React.ReactNode;
  classNames?: Partial<Record<"base" | "row" | "content" | "actions" | "action" | "menu", string>>;
}

interface Gesture {
  pointer: number;
  x: number;
  y: number;
  /** Decided after the first few pixels: a horizontal swipe, or a scroll that is left to the page. */
  axis: "x" | "y" | null;
  start: number;
  /** The row's offset now, kept here and not only in state: the release reads the very last move. */
  offset: number;
}

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="19" cy="12" r="1.75" />
    </svg>
  );
}

/** A full swipe goes past three fifths of the row. */
const FULL = 0.6;

const useIsomorphicLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/**
 * A list row with actions behind it: swipe it sideways to reveal them, all the way to run the one at the
 * edge. The same actions are always in a menu at the end of the row, for a mouse, a keyboard or a screen
 * reader, so the swipe is a shortcut and never the only way.
 */
export const SwipeActions = React.forwardRef<HTMLDivElement, SwipeActionsProps>(function SwipeActions(
  {
    label,
    leadingActions = [],
    trailingActions = [],
    isOpen,
    onOpenChange,
    isDisabled = false,
    showMenu = true,
    menuIcon,
    labels: labelsProp,
    className,
    classNames,
    children,
    ...rest
  },
  forwardedRef,
) {
  const labels = { ...defaultSwipeActionsLabels, ...labelsProp };
  const slots = swipe();
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement);
  const leadingRef = React.useRef<HTMLDivElement>(null);
  const trailingRef = React.useRef<HTMLDivElement>(null);
  const rowRef = React.useRef<HTMLDivElement>(null);
  const gesture = React.useRef<Gesture | null>(null);
  const [ownOpen, setOwnOpen] = React.useState<SwipeActionsSide | null>(null);
  const open = isOpen === undefined ? ownOpen : isOpen;
  const setOpen = (side: SwipeActionsSide | null) => {
    if (side === open) return;
    if (isOpen === undefined) setOwnOpen(side);
    onOpenChange?.(side);
  };
  // While dragging, the row's offset in pixels; at rest, null.
  const [drag, setDrag] = React.useState<number | null>(null);
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const pointerType = React.useRef("mouse");

  const widthOf = (side: SwipeActionsSide) => (side === "leading" ? leadingRef : trailingRef).current?.scrollWidth ?? 0;
  const restingOffset = open === "leading" ? widthOf("leading") : open === "trailing" ? -widthOf("trailing") : 0;
  const offset = drag ?? restingOffset;
  const rowWidth = rowRef.current?.offsetWidth ?? 0;
  const isArmed = drag !== null && rowWidth > 0 && Math.abs(drag) > rowWidth * FULL;

  // Out of reach until revealed: `inert` set on the element, as React 17 and 18 drop it as a prop.
  useIsomorphicLayoutEffect(() => {
    if (leadingRef.current) leadingRef.current.inert = open !== "leading";
    if (trailingRef.current) trailingRef.current.inert = open !== "trailing";
  });

  // A tap anywhere else closes an open row.
  React.useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  });

  /** Runs an action; if it removed the row, focus moves to the row after it (or before), not to the page. */
  const run = (action: SwipeAction) => {
    if (action.isDisabled) return;
    const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-slot="swipe-actions"]'));
    const index = rows.indexOf(rootRef.current!);
    const neighbour = rows[index + 1] ?? rows[index - 1];
    setOpen(null);
    action.onAction();
    requestAnimationFrame(() => {
      if (rootRef.current?.isConnected) return;
      const active = document.activeElement;
      if (active && active !== document.body) return;
      neighbour?.querySelector<HTMLElement>('[data-slot="swipe-actions-menu"]')?.focus();
    });
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Fingers and pens swipe; a mouse has the menu. One finger at a time.
    if (isDisabled || event.pointerType === "mouse" || gesture.current) return;
    gesture.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY, axis: null, start: restingOffset, offset: restingOffset };
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = gesture.current;
    if (!state || state.pointer !== event.pointerId) return;
    const dx = event.clientX - state.x;
    const dy = event.clientY - state.y;
    if (!state.axis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      state.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (state.axis === "x") capture(event);
    }
    if (state.axis !== "x") return;
    let next = state.start + dx;
    // No actions on a side: the row barely gives way there.
    if (next > 0 && !leadingActions.length) next /= 6;
    if (next < 0 && !trailingActions.length) next /= 6;
    state.offset = next;
    setDrag(next);
  };
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = gesture.current;
    if (!state || state.pointer !== event.pointerId) return;
    gesture.current = null;
    setDrag(null);
    if (state.axis !== "x") return;
    const width = rowRef.current?.offsetWidth ?? 1;
    const final = state.offset;
    if (final > width * FULL && leadingActions.length) return run(leadingActions[0]!);
    if (final < -width * FULL && trailingActions.length) return run(trailingActions[trailingActions.length - 1]!);
    if (final > widthOf("leading") / 2 && leadingActions.length) return setOpen("leading");
    if (final < -widthOf("trailing") / 2 && trailingActions.length) return setOpen("trailing");
    setOpen(null);
  };

  const side = (actions: readonly SwipeAction[], which: SwipeActionsSide) => {
    if (!actions.length) return null;
    const isShown = open === which || (which === "leading" ? offset > 0 : offset < 0);
    const edge = which === "leading" ? 0 : actions.length - 1;
    return (
      <div
        ref={which === "leading" ? leadingRef : trailingRef}
        data-slot={`swipe-actions-${which}`}
        aria-hidden={open !== which}
        className={slots.actions({ class: [which === "leading" ? "left-0" : "right-0", classNames?.actions] })}
        // Past the actions' own width the panel stretches with the row, and the edge action fills it.
        style={{ visibility: isShown ? "visible" : "hidden", minWidth: drag !== null && isShown ? Math.abs(drag) : undefined }}
      >
        {actions.map((action, i) => (
          <button
            key={action.key}
            type="button"
            disabled={action.isDisabled}
            data-edge={i === edge ? "" : undefined}
            data-armed={i === edge && isArmed ? "" : undefined}
            onClick={() => run(action)}
            className={cn(slots.action({ class: classNames?.action }), actionColor[action.color ?? "default"])}
          >
            {action.icon ? <span aria-hidden="true">{action.icon}</span> : null}
            {action.label}
          </button>
        ))}
      </div>
    );
  };

  const all = [
    ...leadingActions.map((action) => ({ action, id: `leading-${action.key}` })),
    ...trailingActions.map((action) => ({ action, id: `trailing-${action.key}` })),
  ];

  return (
    <div
      ref={rootRef}
      data-slot="swipe-actions"
      data-open={open ?? undefined}
      data-moved={offset ? "" : undefined}
      data-disabled={isDisabled ? "" : undefined}
      className={slots.base({ class: [classNames?.base, className] })}
      {...rest}
    >
      {side(leadingActions, "leading")}
      {side(trailingActions, "trailing")}
      <div
        ref={rowRef}
        data-slot="swipe-actions-row"
        data-settling={drag === null ? "" : undefined}
        className={slots.row({ class: classNames?.row })}
        style={{ transform: offset ? `translateX(${offset}px)` : undefined }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={(event) => {
          if (gesture.current?.pointer !== event.pointerId) return;
          gesture.current = null;
          setDrag(null);
        }}
        // A tap on an open row closes it instead of doing what the row does.
        onClickCapture={(event) => {
          if (!open) return;
          event.preventDefault();
          event.stopPropagation();
          setOpen(null);
        }}
      >
        <div className={slots.content({ class: classNames?.content })}>{children}</div>
        {showMenu && all.length ? (
          <Dropdown isOpen={isMenuOpen} onOpenChange={setMenuOpen}>
            <DropdownTrigger>
              <button
                type="button"
                data-slot="swipe-actions-menu"
                disabled={isDisabled}
                aria-label={labels.menu(label)}
                className={slots.menu({ class: classNames?.menu })}
                // A finger landing here may be starting a swipe: the menu opens on the tap's click, not the press.
                onPointerDown={(event) => {
                  pointerType.current = event.pointerType;
                  if (event.pointerType !== "mouse") event.preventDefault();
                }}
                onClick={() => {
                  if (pointerType.current !== "mouse" && !gesture.current && drag === null) setMenuOpen(true);
                  pointerType.current = "mouse";
                }}
              >
                {menuIcon ?? <DotsIcon />}
              </button>
            </DropdownTrigger>
            <DropdownContent
              align="end"
              // When an action removed the row, its button is gone: focus goes to the next row instead.
              onCloseAutoFocus={(event) => {
                if (!rootRef.current?.isConnected) event.preventDefault();
              }}
            >
              {all.map(({ action, id }) => (
                <DropdownItem
                  key={id}
                  isDisabled={action.isDisabled}
                  color={action.color === "danger" ? "danger" : undefined}
                  startContent={action.icon}
                  onAction={() => run(action)}
                >
                  {action.label}
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>
        ) : null}
      </div>
    </div>
  );
});
