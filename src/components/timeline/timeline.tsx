import * as React from "react";
import { tv } from "../../utils/tv";
import type { CenngeColor, CenngeSize } from "../../types";

interface TimelineContextValue {
  orientation: "vertical" | "horizontal";
  color: CenngeColor;
  size: CenngeSize;
  activeIndex?: number;
  upcomingLabel: string;
}

const TimelineContext = React.createContext<TimelineContextValue>({
  orientation: "vertical",
  color: "primary",
  size: "md",
  upcomingLabel: "upcoming",
});

/* The index of each item, so items do not need an index prop. */
const IndexContext = React.createContext<{ index: number; isLast: boolean }>({ index: 0, isLast: true });

const timeline = tv({
  slots: {
    list: "m-0 flex list-none p-0",
    item: "relative flex min-w-0",
    rail: "flex shrink-0 items-center",
    // Fixed-size box keeps dots and icon bullets on one axis.
    bullet: "relative z-10 flex shrink-0 items-center justify-center",
    marker: [
      "flex items-center justify-center rounded-full",
      "transition-colors duration-(--cennge-duration) motion-reduce:transition-none",
    ],
    line: "shrink-0",
    body: "flex min-w-0 flex-col gap-1",
    header: "flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5",
    title: "font-semibold text-foreground",
    time: "text-xs text-muted tabular-nums",
    content: "text-sm text-muted",
  },
  variants: {
    orientation: {
      vertical: {
        list: "flex-col",
        item: "gap-3",
        rail: "flex-col self-stretch",
        line: "my-1 w-0 flex-1 border-l-2",
        body: "pb-6",
      },
      horizontal: {
        // Scrolls inside itself on narrow screens instead of scrolling the page.
        list: [
          "overflow-x-auto pb-2 [scrollbar-color:var(--cennge-border)_transparent] scrollbar-thin",
          "rounded-small outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
        ],
        item: "min-w-44 flex-1 flex-col gap-3 last:flex-none",
        rail: "flex-row",
        line: "mx-1 h-0 flex-1 border-t-2",
        body: "pr-6",
      },
    },
    size: {
      sm: { bullet: "size-5 [&_svg]:size-3", title: "text-sm" },
      md: { bullet: "size-6 [&_svg]:size-3.5", title: "text-sm" },
      lg: { bullet: "size-8 [&_svg]:size-4", title: "text-base" },
    },
    hasIcon: {
      true: { marker: "size-full" },
      false: {},
    },
    isDone: {
      true: { marker: "inset-shadow-tactile shadow-raised" },
      false: { marker: "border-2 border-border bg-surface-2 text-muted", title: "text-muted" },
    },
    isLast: {
      true: { body: "pb-0 pr-0" },
    },
  },
  compoundVariants: [
    // A plain dot is smaller than the bullet box.
    { hasIcon: false, size: "sm", class: { marker: "size-2.5" } },
    { hasIcon: false, size: "md", class: { marker: "size-3" } },
    { hasIcon: false, size: "lg", class: { marker: "size-3.5" } },
  ],
});

/* Literal per colour so Tailwind can find the classes. */
const doneBullet: Record<CenngeColor, string> = {
  default: "bg-default-500 text-white",
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-danger text-danger-foreground",
  info: "bg-info text-info-foreground",
};

const doneLine: Record<CenngeColor, string> = {
  default: "border-default-500",
  primary: "border-primary",
  secondary: "border-secondary",
  success: "border-success",
  warning: "border-warning",
  danger: "border-danger",
  info: "border-info",
};

export interface TimelineProps extends React.OlHTMLAttributes<HTMLOListElement> {
  /** @default "vertical" */
  orientation?: "vertical" | "horizontal";
  /**
   * Progress, for tracking flows ("ordered → shipped → delivered"): items up to this index are
   * done and coloured, the item at it is aria-current, later items are muted. Omit for a plain history.
   */
  activeIndex?: number;
  /** @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  /** Read after the title of items past activeIndex. @default "upcoming" */
  upcomingLabel?: string;
}

export const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(function Timeline(
  {
    orientation = "vertical",
    activeIndex,
    color = "primary",
    size = "md",
    upcomingLabel = "upcoming",
    className,
    children,
    ...rest
  },
  ref,
) {
  const context = React.useMemo(
    () => ({ orientation, color, size, activeIndex, upcomingLabel }),
    [orientation, color, size, activeIndex, upcomingLabel],
  );
  const items = React.Children.toArray(children).filter(React.isValidElement);
  const slots = timeline({ orientation, size });

  return (
    <TimelineContext.Provider value={context}>
      <ol
        ref={ref}
        // A horizontal timeline can overflow and scroll: keyboard users must be able to reach it.
        tabIndex={orientation === "horizontal" ? 0 : undefined}
        className={slots.list({ class: className })}
        {...rest}
      >
        {items.map((item, index) => (
          <IndexContext.Provider key={item.key ?? index} value={{ index, isLast: index === items.length - 1 }}>
            {item}
          </IndexContext.Provider>
        ))}
      </ol>
    </TimelineContext.Provider>
  );
});

export interface TimelineItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title" | "color"> {
  title: React.ReactNode;
  /** When it happened: "2 hours ago", "Oct 18". */
  time?: React.ReactNode;
  /** Machine-readable time for the <time> element, e.g. "2026-10-18T14:30". */
  dateTime?: string;
  /** Icon inside the bullet. */
  bullet?: React.ReactNode;
  /** Overrides the timeline colour for this item, e.g. danger for a failed deploy. */
  color?: CenngeColor;
  /** Style of the line from this item to the next. Dashed suits planned events. @default "solid" */
  lineVariant?: "solid" | "dashed";
}

export const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(function TimelineItem(
  { title, time, dateTime, bullet, color: colorProp, lineVariant = "solid", className, children, ...rest },
  ref,
) {
  const { orientation, color: timelineColor, size, activeIndex, upcomingLabel } = React.useContext(TimelineContext);
  const { index, isLast } = React.useContext(IndexContext);
  const color = colorProp ?? timelineColor;
  const isDone = activeIndex === undefined || index <= activeIndex;
  const isLineDone = activeIndex === undefined || index < activeIndex;
  const slots = timeline({ orientation, size, isDone, isLast, hasIcon: Boolean(bullet) });

  return (
    <li
      ref={ref}
      aria-current={activeIndex === index ? "step" : undefined}
      data-state={isDone ? "done" : "upcoming"}
      className={slots.item({ class: className })}
      {...rest}
    >
      <div className={slots.rail()} aria-hidden="true">
        <span data-slot="bullet" className={slots.bullet()}>
          <span data-slot="marker" className={slots.marker({ class: isDone ? doneBullet[color] : undefined })}>
            {bullet}
          </span>
        </span>
        {isLast ? null : (
          <span
            data-slot="line"
            className={slots.line({
              class: [
                isLineDone ? doneLine[color] : "border-border",
                lineVariant === "dashed" ? "border-dashed" : "border-solid",
              ],
            })}
          />
        )}
      </div>
      <div className={slots.body()}>
        <div className={slots.header()}>
          <span data-slot="title" className={slots.title()}>
            {title}
            {isDone ? null : <span className="sr-only">, {upcomingLabel}</span>}
          </span>
          {/* <time> needs a machine-readable value; "2 hours ago" alone is not one, so it stays a span. */}
          {time && dateTime ? (
            <time dateTime={dateTime} className={slots.time()}>
              {time}
            </time>
          ) : time ? (
            <span className={slots.time()}>{time}</span>
          ) : null}
        </div>
        {children ? <div className={slots.content()}>{children}</div> : null}
      </div>
    </li>
  );
});
