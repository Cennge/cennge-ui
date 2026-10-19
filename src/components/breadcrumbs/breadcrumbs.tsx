import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "../../utils/cn";

export interface BreadcrumbItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** The page this item points to. Without it the item renders as text. */
  href?: string;
  /** The current page. Set automatically on the last item. */
  isCurrent?: boolean;
  /** Render your router's link (e.g. Next.js `<Link>`) with breadcrumb styles. */
  asChild?: boolean;
  startContent?: React.ReactNode;
}

const linkClass = [
  "inline-flex items-center gap-1.5 rounded-small text-muted transition-colors duration-(--cennge-duration-fast)",
  "hover:text-foreground outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
].join(" ");

export const BreadcrumbItem = React.forwardRef<HTMLAnchorElement, BreadcrumbItemProps>(function BreadcrumbItem(
  { href, isCurrent = false, asChild = false, startContent, className, children, ...rest },
  ref,
) {
  if (isCurrent) {
    return (
      <span aria-current="page" className={cn("inline-flex items-center gap-1.5 font-semibold text-foreground", className)}>
        {startContent}
        {children}
      </span>
    );
  }
  if (asChild) {
    return (
      <Slot.Root ref={ref} className={cn(linkClass, className)} {...rest}>
        {children}
      </Slot.Root>
    );
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={cn(linkClass, className)} {...rest}>
        {startContent}
        {children}
      </a>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-muted", className)}>
      {startContent}
      {children}
    </span>
  );
});

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.25">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  /** Between items. @default a chevron */
  separator?: React.ReactNode;
  /** Collapse the middle into "…" when there are more items than this. */
  maxItems?: number;
  /** Items kept before the "…". @default 1 */
  itemsBeforeCollapse?: number;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** @default "Breadcrumb" */
  "aria-label"?: string;
}

type Entry = { kind: "item"; element: React.ReactElement<BreadcrumbItemProps> } | { kind: "ellipsis" };

export const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  {
    separator,
    maxItems,
    itemsBeforeCollapse = 1,
    size = "md",
    className,
    children,
    "aria-label": ariaLabel = "Breadcrumb",
    ...rest
  },
  ref,
) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const items = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<BreadcrumbItemProps>[];
  const lastIndex = items.length - 1;

  const withCurrent = items.map((element, index) =>
    index === lastIndex && element.props.isCurrent === undefined
      ? React.cloneElement(element, { isCurrent: true })
      : element,
  );

  let entries: Entry[] = withCurrent.map((element) => ({ kind: "item", element }));
  if (!isExpanded && maxItems !== undefined && items.length > maxItems) {
    const before = Math.min(itemsBeforeCollapse, maxItems - 1);
    const after = Math.max(maxItems - before, 1);
    entries = [
      ...entries.slice(0, before),
      { kind: "ellipsis" },
      ...entries.slice(entries.length - after),
    ];
  }

  return (
    <nav ref={ref} aria-label={ariaLabel} className={className} {...rest}>
      <ol
        className={cn(
          "flex flex-wrap items-center gap-1.5",
          size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm",
        )}
      >
        {entries.map((entry, index) => (
          <li key={entry.kind === "item" ? (entry.element.key ?? index) : "ellipsis"} className="inline-flex min-w-0 items-center gap-1.5">
            {index > 0 ? (
              <span aria-hidden="true" className="flex text-muted/60">
                {separator ?? <ChevronIcon />}
              </span>
            ) : null}
            {entry.kind === "item" ? (
              entry.element
            ) : (
              <button
                type="button"
                aria-label="Show all breadcrumbs"
                onClick={() => setIsExpanded(true)}
                className={cn(linkClass, "cursor-pointer px-1")}
              >
                …
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
});
