import * as React from "react";
import { tv } from "../../utils/tv";
import { useId } from "../../utils/use-id";
import { cn } from "../../utils/cn";
import { Button } from "../button";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const carousel = tv({
  slots: {
    base: "relative flex flex-col gap-3 [--carousel-gap:1rem] [--carousel-per-view:1]",
    content: "relative",
    viewport: [
      "flex gap-(--carousel-gap) overflow-x-auto overscroll-x-contain snap-x snap-mandatory",
      "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      "rounded-large outline-none",
      "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring",
      "pointer-fine:cursor-grab data-[dragging]:cursor-grabbing data-[dragging]:snap-none data-[dragging]:select-none",
    ],
    item: [
      "relative min-w-0 shrink-0 grow-0 snap-always",
      "basis-[calc((100%_-_(var(--carousel-per-view)_-_1)_*_var(--carousel-gap))_/_var(--carousel-per-view))]",
    ],
    arrow: "aria-disabled:cursor-not-allowed aria-disabled:opacity-(--cennge-disabled-opacity) aria-disabled:active:scale-100",
    overlayArrow: "absolute top-1/2 z-10 -translate-y-1/2 shadow-raised",
    previous: "left-2",
    next: "right-2",
    overlayAutoplay: "absolute top-2 right-2 z-10 shadow-raised",
    controls: "flex items-center justify-between gap-2",
    controlsCenter: "flex min-w-0 items-center justify-center gap-1",
    dots: "flex min-h-6 flex-wrap items-center justify-center",
    dot: "group/dot rounded-full p-2 outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring",
    dotMark: [
      "block h-2 w-2 rounded-full bg-foreground/25",
      "transition-colors duration-(--cennge-duration-fast) motion-reduce:transition-none",
      "group-hover/dot:bg-foreground/45 group-aria-[current]/dot:w-6 group-aria-[current]/dot:bg-primary",
    ],
  },
  variants: {
    align: {
      start: { item: "snap-start" },
      center: { item: "snap-center" },
    },
  },
});

export interface CarouselLabels {
  /** Role description of the carousel, read instead of "region". @default "carousel" */
  carousel: string;
  /** Role description of a slide. @default "slide" */
  slide: string;
  /** Name of a slide. @default (index, count) => `${index} of ${count}` */
  slideName: (index: number, count: number) => string;
  /** Name of the scrolling list of slides. @default "Slides" */
  slides: string;
  /** Spoken after a move when several slides show at once. @default (index, count) => `Page ${index} of ${count}` */
  pageName: (index: number, count: number) => string;
  /** @default "Previous slide" */
  previous: string;
  /** @default "Next slide" */
  next: string;
  /** Name of the group of dots. @default "Choose slide" */
  pagination: string;
  /** @default (index) => `Slide ${index}` */
  goToSlide: (index: number) => string;
  /** @default (index) => `Page ${index}` */
  goToPage: (index: number) => string;
  /** @default "Pause slide show" */
  pause: string;
  /** @default "Play slide show" */
  play: string;
}

const defaultLabels: CarouselLabels = {
  carousel: "carousel",
  slide: "slide",
  slideName: (index, count) => `${index} of ${count}`,
  slides: "Slides",
  pageName: (index, count) => `Page ${index} of ${count}`,
  previous: "Previous slide",
  next: "Next slide",
  pagination: "Choose slide",
  goToSlide: (index) => `Slide ${index}`,
  goToPage: (index) => `Page ${index}`,
  pause: "Pause slide show",
  play: "Play slide show",
};

export interface CarouselApi {
  /** The current position: a slide, or a page when several slides show at once. */
  index: number;
  /** Number of positions. */
  count: number;
  /** Number of slides. */
  slideCount: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollTo: (index: number) => void;
  scrollPrev: () => void;
  scrollNext: () => void;
  /** Autoplay is running (it may still be paused while the pointer is over the carousel). */
  isPlaying: boolean;
  setPlaying: (isPlaying: boolean) => void;
}

interface CarouselContextValue extends CarouselApi {
  viewportRef: React.MutableRefObject<HTMLDivElement | null>;
  viewportId: string | undefined;
  hasAutoplay: boolean;
  /** CarouselControls is a direct child and shows the play/pause button; otherwise it sits over the slides. */
  toggleInControls: boolean;
  labels: CarouselLabels;
  slots: ReturnType<typeof carousel>;
  setSlideCount: (count: number) => void;
  measure: () => void;
  stopAutoplay: () => void;
  /** The dragging pointer moved: autoplay stops and the next click is a drop, not a click. */
  dragging: React.MutableRefObject<boolean>;
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);
/** A slide's place, known while rendering (also on the server), so names never read "1 of 1". */
const ItemContext = React.createContext({ index: 0, count: 1 });

/** The carousel's state and moves, for custom controls such as thumbnails. Use inside <Carousel>. */
export function useCarousel(): CarouselApi {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error("useCarousel must be used inside <Carousel>");
  return context;
}

function useCarouselContext(part: string) {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error(`${part} must be used inside <Carousel>`);
  return context;
}

/** scrollTo where it exists (every browser); plain scrollLeft elsewhere, such as jsdom. */
function scrollViewport(node: HTMLElement, left: number, behavior: ScrollBehavior) {
  if (typeof node.scrollTo === "function") node.scrollTo({ left, behavior });
  else node.scrollLeft = left;
}

function prefersReducedMotion(node: Element | null) {
  if (node?.closest('[data-cennge-motion="reduce"]')) return true;
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export interface CarouselProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** Names the carousel; a visible heading via aria-labelledby works too. */
  "aria-label"?: string;
  /** Slides in view at once; fractions show part of the next slide. Responsive: `md:[--carousel-per-view:3]`. @default 1 */
  slidesPerView?: number;
  /** Space between slides, any CSS length. @default "1rem" */
  gap?: string;
  /** Where a slide stops: at the start of the view, or centred in it. @default "start" */
  align?: "start" | "center";
  /** Next on the last slide goes back to the first, Previous on the first to the last. */
  loop?: boolean;
  /**
   * Moves on by itself: `true` every 5 s, or a number of milliseconds. It pauses while the pointer is over
   * the carousel and stops when focus enters it or the user drags; a pause button is always shown.
   * Never starts on its own with reduced motion.
   */
  autoplay?: boolean | number;
  /** The current position. */
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  labels?: Partial<CarouselLabels>;
}

/**
 * A row of slides on native scroll snapping: a finger, a trackpad and the keyboard scroll it as usual,
 * a mouse can drag it. Follows the WAI-ARIA carousel pattern.
 */
export const Carousel = React.forwardRef<HTMLElement, CarouselProps>(function Carousel(
  {
    slidesPerView,
    gap,
    align = "start",
    loop = false,
    autoplay = false,
    index: indexProp,
    defaultIndex = 0,
    onIndexChange,
    labels: labelsProp,
    className,
    style,
    children,
    onPointerEnter,
    onPointerLeave,
    onFocus,
    ...rest
  },
  forwardedRef,
) {
  const rootRef = React.useRef<HTMLElement | null>(null);
  React.useImperativeHandle(forwardedRef, () => rootRef.current as HTMLElement);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const viewportId = useId();
  const labels = React.useMemo(() => ({ ...defaultLabels, ...labelsProp }), [labelsProp]);
  const slots = carousel({ align });

  const [slideCount, setSlideCount] = React.useState(0);
  // Scroll positions where the carousel stops: one per slide, fewer when several show at once.
  const [snaps, setSnaps] = React.useState<number[]>([]);
  const snapsRef = React.useRef<number[]>([]);
  snapsRef.current = snaps;
  const [index, setIndex] = React.useState(defaultIndex);
  const indexRef = React.useRef(index);
  indexRef.current = index;
  // While a move started by a button or key runs, the positions it passes are not the new index.
  const target = React.useRef<number | null>(null);
  const dragging = React.useRef(false);
  // Before the first measure (and on the server) the slides of a direct CarouselContent are a good guess.
  const content = React.Children.toArray(children).find(
    (child): child is React.ReactElement<{ children?: React.ReactNode }> =>
      React.isValidElement(child) && child.type === CarouselContent,
  );
  const estimated = content ? React.Children.count(content.props.children) : 0;
  const count = snaps.length || slideCount || estimated;

  const report = React.useCallback(
    (next: number) => {
      if (next === indexRef.current) return;
      indexRef.current = next;
      setIndex(next);
      onIndexChange?.(next);
    },
    [onIndexChange],
  );

  const sync = React.useCallback(() => {
    const node = viewportRef.current;
    const list = snapsRef.current;
    if (!node || list.length === 0) return;
    const left = node.scrollLeft;
    if (target.current !== null) {
      if (Math.abs(left - (list[target.current] ?? left)) > 2) return;
      target.current = null;
    }
    let nearest = 0;
    list.forEach((snap, i) => {
      if (Math.abs(snap - left) < Math.abs((list[nearest] ?? 0) - left)) nearest = i;
    });
    report(nearest);
  }, [report]);

  const measure = React.useCallback(() => {
    const node = viewportRef.current;
    if (!node) return;
    const max = node.scrollWidth - node.clientWidth;
    const origin = node.getBoundingClientRect().left - node.scrollLeft;
    const positions: number[] = [];
    for (const child of Array.from(node.children)) {
      if (!(child instanceof HTMLElement) || !child.hasAttribute("data-carousel-item")) continue;
      const box = child.getBoundingClientRect();
      const start = box.left - origin;
      const raw = align === "center" ? start + box.width / 2 - node.clientWidth / 2 : start;
      const position = Math.round(Math.min(Math.max(raw, 0), Math.max(max, 0)));
      const last = positions[positions.length - 1];
      if (last === undefined || Math.abs(position - last) > 1) positions.push(position);
    }
    setSnaps((previous) => (String(previous) === String(positions) ? previous : positions));
  }, [align]);

  const scrollTo = React.useCallback(
    (next: number) => {
      const node = viewportRef.current;
      const list = snapsRef.current;
      if (!node || list.length === 0) return;
      const clamped = Math.min(Math.max(next, 0), list.length - 1);
      const left = list[clamped] ?? 0;
      report(clamped);
      if (Math.abs(node.scrollLeft - left) <= 2) return;
      target.current = clamped;
      scrollViewport(node, left, prefersReducedMotion(node) ? "auto" : "smooth");
    },
    [report],
  );

  const canScrollPrev = count > 1 && (loop || index > 0);
  const canScrollNext = count > 1 && (loop || index < count - 1);
  const scrollPrev = React.useCallback(() => {
    if (indexRef.current > 0) scrollTo(indexRef.current - 1);
    else if (loop) scrollTo(snapsRef.current.length - 1);
  }, [loop, scrollTo]);
  const scrollNext = React.useCallback(() => {
    if (indexRef.current < snapsRef.current.length - 1) scrollTo(indexRef.current + 1);
    else if (loop) scrollTo(0);
  }, [loop, scrollTo]);

  // Follow scrolling (fingers, trackpads, keys, our own smooth moves) and size changes.
  React.useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };
    // A finger or wheel takes over from a running move.
    const takeOver = () => {
      target.current = null;
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    node.addEventListener("wheel", takeOver, { passive: true });
    node.addEventListener("touchstart", takeOver, { passive: true });
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resize?.observe(node);
    return () => {
      cancelAnimationFrame(frame);
      node.removeEventListener("scroll", onScroll);
      node.removeEventListener("wheel", takeOver);
      node.removeEventListener("touchstart", takeOver);
      resize?.disconnect();
    };
  }, [measure, sync]);

  useIsomorphicLayoutEffect(() => {
    measure();
  }, [measure, slideCount, slidesPerView, gap]);

  // A new set of stops (first measure, resize): keep showing the same position.
  const positioned = React.useRef(false);
  useIsomorphicLayoutEffect(() => {
    const node = viewportRef.current;
    if (!node || snaps.length === 0) return;
    const keep = Math.min(indexRef.current, snaps.length - 1);
    if (!positioned.current || Math.abs(node.scrollLeft - (snaps[keep] ?? 0)) > 1) {
      scrollViewport(node, snaps[keep] ?? 0, "auto");
    }
    positioned.current = true;
    if (keep !== indexRef.current) report(keep);
  }, [snaps]);

  // Controlled index.
  React.useEffect(() => {
    if (indexProp !== undefined && indexProp !== indexRef.current) scrollTo(indexProp);
  }, [indexProp, scrollTo]);

  /* ------------------------------------------------------------- autoplay */
  const interval = typeof autoplay === "number" ? autoplay : 5000;
  const hasAutoplay = autoplay !== false;
  const [isPlaying, setPlaying] = React.useState(false);
  const [isHovered, setHovered] = React.useState(false);
  const [isHidden, setHidden] = React.useState(false);
  React.useEffect(() => {
    if (hasAutoplay && !prefersReducedMotion(rootRef.current)) setPlaying(true);
    if (!hasAutoplay) setPlaying(false);
  }, [hasAutoplay]);
  React.useEffect(() => {
    const update = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  React.useEffect(() => {
    if (!hasAutoplay || !isPlaying || isHovered || isHidden || count < 2) return;
    const timer = setTimeout(() => {
      if (indexRef.current < snapsRef.current.length - 1) scrollTo(indexRef.current + 1);
      else scrollTo(0);
    }, interval);
    return () => clearTimeout(timer);
  }, [hasAutoplay, isPlaying, isHovered, isHidden, count, index, interval, scrollTo]);
  const stopAutoplay = React.useCallback(() => setPlaying(false), []);

  const api: CarouselContextValue = {
    index,
    count,
    slideCount,
    canScrollPrev,
    canScrollNext,
    scrollTo,
    scrollPrev,
    scrollNext,
    isPlaying,
    setPlaying,
    viewportRef,
    viewportId,
    hasAutoplay,
    toggleInControls:
      hasAutoplay &&
      React.Children.toArray(children).some((child) => React.isValidElement(child) && child.type === CarouselControls),
    labels,
    slots,
    setSlideCount,
    measure,
    stopAutoplay,
    dragging,
  };

  // A carousel role description belongs on a named region; without a name it is a plain section.
  const isNamed = Boolean(rest["aria-label"] || rest["aria-labelledby"]);
  const announcement =
    count === 0 ? "" : count === slideCount ? labels.slideName(index + 1, count) : labels.pageName(index + 1, count);

  return (
    <CarouselContext.Provider value={api}>
      <section
        ref={rootRef}
        aria-roledescription={isNamed ? labels.carousel : undefined}
        className={slots.base({ class: className })}
        style={{
          ...(slidesPerView !== undefined ? { "--carousel-per-view": slidesPerView } : null),
          ...(gap !== undefined ? { "--carousel-gap": gap } : null),
          ...style,
        } as React.CSSProperties}
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          if (event.pointerType === "mouse") setHovered(true);
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          setHovered(false);
        }}
        onFocus={(event) => {
          onFocus?.(event);
          // WAI-ARIA APG: rotation stops when focus enters the carousel, until the user restarts it.
          // Not for the play/pause button: a click focuses it first, and the click itself decides.
          const entering = !event.currentTarget.contains(event.relatedTarget as Node | null);
          if (entering && !(event.target as Element).closest("[data-carousel-autoplay]")) setPlaying(false);
        }}
        {...rest}
      >
        {children}
        {/* Off while autoplay runs, so a moving carousel does not keep talking. */}
        <div aria-live={isPlaying ? "off" : "polite"} aria-atomic="true" className="sr-only">
          {announcement}
        </div>
      </section>
    </CarouselContext.Provider>
  );
});

export interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Previous and Next over the slides, for image galleries. Text cards read better with CarouselControls below. */
  arrows?: boolean;
  /** Classes for the scrolling element (the wrapper gets `className`). */
  viewportClassName?: string;
}

/** The scrolling row. Wrap each slide in a CarouselItem. */
export const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(function CarouselContent(
  { arrows = false, className, viewportClassName, children, onKeyDown, onPointerDown, onPointerMove, onPointerUp, onClickCapture, ...rest },
  forwardedRef,
) {
  const context = useCarouselContext("CarouselContent");
  const { slots, labels, viewportRef, viewportId, setSlideCount, scrollTo, scrollPrev, scrollNext, stopAutoplay, dragging } =
    context;
  const slideCount = React.Children.count(children);
  useIsomorphicLayoutEffect(() => setSlideCount(slideCount), [slideCount, setSlideCount]);

  // Mouse drag; fingers and trackpads scroll natively.
  const drag = React.useRef<{ pointer: number; x: number; left: number; start: number } | null>(null);
  const suppressClick = React.useRef(false);

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const node = viewportRef.current;
    const state = drag.current;
    drag.current = null;
    if (!node || !state) return;
    if (node.hasPointerCapture(state.pointer)) node.releasePointerCapture(state.pointer);
    if (!dragging.current) return;
    dragging.current = false;
    suppressClick.current = true;
    // A flick of 40px or more turns the page; a shorter drag settles on the nearest one.
    const moved = event.clientX - state.x;
    if (moved <= -40) scrollTo(state.start + 1);
    else if (moved >= 40) scrollTo(state.start - 1);
    else scrollTo(state.start);
    // Snapping stays off until the move lands, or the browser would jump to a stop half-way.
    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      node.removeAttribute("data-dragging");
      node.removeEventListener("scrollend", restore);
    };
    node.addEventListener("scrollend", restore);
    window.setTimeout(restore, 700);
  };

  return (
    <div className={slots.content({ class: className })}>
      {context.hasAutoplay && !context.toggleInControls ? <CarouselAutoplayButton className={slots.overlayAutoplay()} /> : null}
      <div
        ref={(node) => {
          viewportRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        id={viewportId}
        role="group"
        aria-label={labels.slides}
        tabIndex={0}
        className={slots.viewport({ class: viewportClassName })}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.target !== event.currentTarget) return;
          const moves: Record<string, () => void> = {
            ArrowLeft: scrollPrev,
            ArrowRight: scrollNext,
            Home: () => scrollTo(0),
            End: () => scrollTo(context.count - 1),
          };
          const move = moves[event.key];
          if (!move) return;
          event.preventDefault();
          move();
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (event.pointerType !== "mouse" || event.button !== 0) return;
          drag.current = { pointer: event.pointerId, x: event.clientX, left: event.currentTarget.scrollLeft, start: context.index };
        }}
        onPointerMove={(event) => {
          onPointerMove?.(event);
          const state = drag.current;
          const node = event.currentTarget;
          if (!state || state.pointer !== event.pointerId) return;
          const moved = event.clientX - state.x;
          if (!dragging.current) {
            if (Math.abs(moved) < 5) return;
            dragging.current = true;
            stopAutoplay();
            node.setPointerCapture(event.pointerId);
            node.setAttribute("data-dragging", "");
          }
          node.scrollLeft = state.left - moved;
        }}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          finishDrag(event);
        }}
        onPointerCancel={finishDrag}
        onClickCapture={(event) => {
          onClickCapture?.(event);
          // The click that ends a drag is not a click on the slide under the pointer.
          if (!suppressClick.current) return;
          suppressClick.current = false;
          event.preventDefault();
          event.stopPropagation();
        }}
        onDragStart={(event) => event.preventDefault()}
        {...rest}
      >
        {React.Children.map(children, (child, index) => (
          <ItemContext.Provider value={{ index, count: slideCount }}>{child}</ItemContext.Provider>
        ))}
      </div>
      {arrows && context.count > 1 ? (
        <>
          <CarouselPrevious className={cn(slots.overlayArrow(), slots.previous())} />
          <CarouselNext className={cn(slots.overlayArrow(), slots.next())} />
        </>
      ) : null}
    </div>
  );
});

export type CarouselItemProps = React.HTMLAttributes<HTMLDivElement>;

/** One slide, named "3 of 8" unless you give it a name. */
export const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(function CarouselItem(
  { className, ...rest },
  ref,
) {
  const { slots, labels } = useCarouselContext("CarouselItem");
  const { index, count } = React.useContext(ItemContext);
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription={labels.slide}
      aria-label={rest["aria-labelledby"] ? undefined : labels.slideName(index + 1, count)}
      data-carousel-item=""
      className={slots.item({ class: className })}
      {...rest}
    />
  );
});

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <path d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type CarouselButtonProps = Omit<React.ComponentProps<typeof Button>, "isIconOnly" | "isDisabled" | "disabled">;

function CarouselArrow({ direction, className, onClick, children, ...rest }: CarouselButtonProps & { direction: "previous" | "next" }) {
  const context = useCarouselContext(direction === "previous" ? "CarouselPrevious" : "CarouselNext");
  const can = direction === "previous" ? context.canScrollPrev : context.canScrollNext;
  return (
    <Button
      isIconOnly
      radius="full"
      size="sm"
      aria-label={direction === "previous" ? context.labels.previous : context.labels.next}
      aria-controls={context.viewportId}
      // aria-disabled, not disabled: focus stays on the button when the carousel reaches its end.
      aria-disabled={!can || undefined}
      className={context.slots.arrow({ class: className })}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !can) return;
        if (direction === "previous") context.scrollPrev();
        else context.scrollNext();
      }}
      {...rest}
    >
      {children ?? <Chevron direction={direction === "previous" ? "left" : "right"} />}
    </Button>
  );
}

/** Part of CarouselControls, or over the slides with `<CarouselContent arrows>`; place it yourself anywhere. */
export function CarouselPrevious(props: CarouselButtonProps) {
  return <CarouselArrow direction="previous" {...props} />;
}

/** Part of CarouselControls, or over the slides with `<CarouselContent arrows>`; place it yourself anywhere. */
export function CarouselNext(props: CarouselButtonProps) {
  return <CarouselArrow direction="next" {...props} />;
}

function CarouselAutoplayButton({ className }: { className?: string }) {
  const context = useCarouselContext("CarouselContent");
  return (
    <Button
      isIconOnly
      radius="full"
      size="sm"
      aria-label={context.isPlaying ? context.labels.pause : context.labels.play}
      aria-controls={context.viewportId}
      data-carousel-autoplay=""
      className={className}
      onClick={() => context.setPlaying(!context.isPlaying)}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
        {context.isPlaying ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l10.5-6.5z" />}
      </svg>
    </Button>
  );
}

export type CarouselDotsProps = React.HTMLAttributes<HTMLDivElement>;

/** A dot per position. One tab stop: arrow keys move between dots and go to their slide. */
export const CarouselDots = React.forwardRef<HTMLDivElement, CarouselDotsProps>(function CarouselDots(
  { className, ...rest },
  ref,
) {
  const { slots, labels, count, slideCount, index, scrollTo, viewportId } = useCarouselContext("CarouselDots");
  const buttons = React.useRef<Array<HTMLButtonElement | null>>([]);
  const isPerSlide = count === slideCount;
  const go = (next: number) => {
    const clamped = Math.min(Math.max(next, 0), count - 1);
    scrollTo(clamped);
    buttons.current[clamped]?.focus();
  };
  return (
    <div ref={ref} role="group" aria-label={labels.pagination} className={slots.dots({ class: className })} {...rest}>
      {count > 1
        ? Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              ref={(node) => {
                buttons.current[i] = node;
              }}
              type="button"
              tabIndex={i === index ? 0 : -1}
              aria-label={isPerSlide ? labels.goToSlide(i + 1) : labels.goToPage(i + 1)}
              aria-current={i === index || undefined}
              aria-controls={viewportId}
              className={slots.dot()}
              onClick={() => scrollTo(i)}
              onKeyDown={(event) => {
                const moves: Record<string, number> = { ArrowLeft: i - 1, ArrowRight: i + 1, Home: 0, End: count - 1 };
                const next = moves[event.key];
                if (next === undefined) return;
                event.preventDefault();
                go(next);
              }}
            >
              <span className={slots.dotMark()} />
            </button>
          ))
        : null}
    </div>
  );
});

export interface CarouselControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default true */
  showArrows?: boolean;
  /** @default true */
  showDots?: boolean;
}

/**
 * The row under the slides: Previous, the dots, Next, and the play/pause button with autoplay.
 * Put it directly inside <Carousel>. Nothing shows while everything fits in one view.
 */
export const CarouselControls = React.forwardRef<HTMLDivElement, CarouselControlsProps>(function CarouselControls(
  { showArrows = true, showDots = true, className, ...rest },
  ref,
) {
  const { slots, count, toggleInControls } = useCarouselContext("CarouselControls");
  if (count < 2) return null;
  return (
    <div ref={ref} className={slots.controls({ class: className })} {...rest}>
      {showArrows ? <CarouselPrevious /> : <span />}
      <div className={slots.controlsCenter()}>
        {toggleInControls ? <CarouselAutoplayButton /> : null}
        {showDots ? <CarouselDots /> : null}
      </div>
      {showArrows ? <CarouselNext /> : <span />}
    </div>
  );
});
