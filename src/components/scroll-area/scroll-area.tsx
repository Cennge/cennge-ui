import * as React from "react";
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";
import { tv } from "../../utils/tv";

const scrollArea = tv({
  slots: {
    base: "relative overflow-hidden",
    viewport: [
      "size-full rounded-[inherit] outline-none",
      "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring",
    ],
    scrollbar: [
      "flex touch-none p-0.5 select-none",
      "transition-colors duration-(--cennge-duration-fast) motion-reduce:transition-none",
      "data-[state=visible]:animate-cennge-fade-in data-[state=hidden]:animate-cennge-fade-out motion-reduce:animate-none",
      "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5",
      "data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col",
      "hover:bg-foreground/5",
    ],
    thumb: [
      "relative flex-1 rounded-full bg-default-500/50 transition-colors duration-(--cennge-duration-fast)",
      "hover:bg-default-500/80 active:bg-default-500 motion-reduce:transition-none",
      // A finger-sized grab area around the thin thumb.
      "before:absolute before:top-1/2 before:left-1/2 before:size-full before:min-h-6 before:min-w-6 before:-translate-1/2",
    ],
    corner: "bg-transparent",
  },
  variants: {
    // Content fades out at an edge while more of it hides behind that edge.
    fadeEdges: {
      true: {
        viewport: [
          "[--fade-top:0px] [--fade-bottom:0px] [--fade-left:0px] [--fade-right:0px]",
          "data-[more-top]:[--fade-top:var(--fade-size)] data-[more-bottom]:[--fade-bottom:var(--fade-size)]",
          "data-[more-left]:[--fade-left:var(--fade-size)] data-[more-right]:[--fade-right:var(--fade-size)]",
          "[mask-image:linear-gradient(to_bottom,transparent,#000_var(--fade-top),#000_calc(100%-var(--fade-bottom)),transparent),linear-gradient(to_right,transparent,#000_var(--fade-left),#000_calc(100%-var(--fade-right)),transparent)]",
          "[mask-composite:intersect]",
        ],
      },
    },
  },
});

export interface ScrollAreaProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "dir"> {
  /**
   * Which way the content scrolls. Vertical content keeps the width of the area, so long lines wrap
   * and `truncate` ends them with "…"; horizontal and both let content grow sideways.
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal" | "both";
  /**
   * When the scrollbars show: on hover, while scrolling, whenever the content overflows, or always.
   * On touch screens, which have no hover, "hover" shows them while scrolling.
   * @default "hover"
   */
  type?: "hover" | "scroll" | "auto" | "always";
  /** How long scrollbars stay after the pointer leaves or scrolling stops, in ms. @default 600 */
  scrollHideDelay?: number;
  /** Fade the content out at edges that hide more of it, so it is clear there is more to scroll. */
  fadeEdges?: boolean;
  /** Length of the fade. @default "1.5rem" */
  fadeSize?: string;
  /** The scrolling element, e.g. to scroll from code or to measure for a virtual list. */
  viewportRef?: React.Ref<HTMLDivElement>;
  classNames?: Partial<Record<"base" | "viewport" | "scrollbar" | "thumb", string>>;
}

/** False on touch screens. True on the server and until mounted, like most desktops. */
function useCanHover() {
  const [canHover, setCanHover] = React.useState(true);
  React.useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(hover: hover)");
    const update = () => setCanHover(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);
  return canHover;
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<T>).current = value;
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  {
    orientation = "vertical",
    type = "hover",
    scrollHideDelay,
    fadeEdges = false,
    fadeSize = "1.5rem",
    viewportRef,
    className,
    classNames,
    style,
    children,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...rest
  },
  ref,
) {
  const canHover = useCanHover();
  const viewport = React.useRef<HTMLDivElement | null>(null);
  const content = React.useRef<HTMLDivElement | null>(null);
  const [isScrollable, setScrollable] = React.useState(false);
  const vertical = orientation !== "horizontal";
  const horizontal = orientation !== "vertical";
  const slots = scrollArea({ fadeEdges });

  // Marks which edges hide more content. Written straight to the DOM: scrolling should not re-render.
  const measure = React.useCallback(() => {
    const node = viewport.current;
    if (!node) return;
    const left = Math.abs(node.scrollLeft); // negative in right-to-left layouts
    const more = {
      top: vertical && node.scrollTop > 1,
      bottom: vertical && node.scrollTop + node.clientHeight < node.scrollHeight - 1,
      left: horizontal && left > 1,
      right: horizontal && left + node.clientWidth < node.scrollWidth - 1,
    };
    for (const [edge, value] of Object.entries(more)) node.toggleAttribute(`data-more-${edge}`, value);
    setScrollable(more.top || more.bottom || more.left || more.right);
  }, [vertical, horizontal]);

  React.useEffect(() => {
    const node = viewport.current;
    if (!node) return;
    measure();
    node.addEventListener("scroll", measure, { passive: true });
    if (typeof ResizeObserver === "undefined") return () => node.removeEventListener("scroll", measure);
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    if (content.current) observer.observe(content.current);
    return () => {
      node.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [measure]);

  const scrollbar = (direction: "vertical" | "horizontal") => (
    <ScrollAreaPrimitive.Scrollbar orientation={direction} className={slots.scrollbar({ class: classNames?.scrollbar })}>
      <ScrollAreaPrimitive.Thumb className={slots.thumb({ class: classNames?.thumb })} />
    </ScrollAreaPrimitive.Scrollbar>
  );

  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      type={type === "hover" && !canHover ? "scroll" : type}
      scrollHideDelay={scrollHideDelay}
      className={slots.base({ class: [classNames?.base, className] })}
      style={style}
      {...rest}
    >
      <ScrollAreaPrimitive.Viewport
        ref={(node: HTMLDivElement | null) => {
          viewport.current = node;
          setRef(viewportRef, node);
        }}
        disableImplicitContentElement
        // Content that scrolls is reachable from the keyboard: the area takes focus and arrows scroll it.
        // With a name it is a region, so screen readers can find it.
        {...(isScrollable
          ? { tabIndex: 0, ...(ariaLabel || ariaLabelledBy ? { role: "region", "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy } : {}) }
          : {})}
        className={slots.viewport({ class: classNames?.viewport })}
        style={fadeEdges ? ({ "--fade-size": fadeSize } as React.CSSProperties) : undefined}
      >
        <ScrollAreaPrimitive.Content
          ref={content}
          // Radix makes this a table so it can grow sideways; that breaks `truncate` (radix-ui/primitives#926).
          // Vertical-only content is a plain block as wide as the area.
          style={horizontal ? { minWidth: "100%", display: "table" } : { minWidth: 0, display: "block" }}
        >
          {children}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      {vertical ? scrollbar("vertical") : null}
      {horizontal ? scrollbar("horizontal") : null}
      {vertical && horizontal ? <ScrollAreaPrimitive.Corner className={slots.corner()} /> : null}
    </ScrollAreaPrimitive.Root>
  );
});
