import * as React from "react";
import { cn } from "../../utils/cn";
import { button } from "../button/button.styles";
import { useCenngeDefaults } from "../../provider";
import type { CenngeColor, CenngeRadius, CenngeSize } from "../../types";

type PageItem = number | "start-ellipsis" | "end-ellipsis";

/** Page numbers to show: always the first and last, `siblings` around the current one, ellipses between. */
export function getPageItems(total: number, page: number, siblings = 1): PageItem[] {
  const slots = siblings * 2 + 5; // first, last, current, 2 ellipses
  if (total <= slots) return Array.from({ length: total }, (_, i) => i + 1);

  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, total);
  const showStart = left > 3;
  const showEnd = right < total - 2;

  if (!showStart) {
    const count = 3 + siblings * 2;
    return [...Array.from({ length: count }, (_, i) => i + 1), "end-ellipsis", total];
  }
  if (!showEnd) {
    const count = 3 + siblings * 2;
    return [1, "start-ellipsis", ...Array.from({ length: count }, (_, i) => total - count + i + 1)];
  }
  return [1, "start-ellipsis", ...Array.from({ length: right - left + 1 }, (_, i) => left + i), "end-ellipsis", total];
}

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange" | "color"> {
  /** Number of pages. */
  total: number;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Pages shown on each side of the current one. @default 1 */
  siblings?: number;
  /** Previous / next buttons. @default true */
  showControls?: boolean;
  /** Colour of the current page. @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  /** @default "md" */
  radius?: CenngeRadius;
  isDisabled?: boolean;
  /** @default "Pagination" */
  "aria-label"?: string;
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <path d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    total,
    page: pageProp,
    defaultPage = 1,
    onPageChange,
    siblings = 1,
    showControls = true,
    color,
    size,
    radius,
    isDisabled = false,
    className,
    "aria-label": ariaLabel = "Pagination",
    ...rest
  },
  ref,
) {
  const defaults = useCenngeDefaults();
  const [inner, setInner] = React.useState(defaultPage);
  const page = Math.min(Math.max(pageProp ?? inner, 1), Math.max(total, 1));
  const go = (next: number) => {
    const clamped = Math.min(Math.max(next, 1), total);
    if (clamped === page) return;
    if (pageProp === undefined) setInner(clamped);
    onPageChange?.(clamped);
  };

  const common = {
    size: size ?? defaults.size ?? "md",
    radius: radius ?? defaults.radius ?? "md",
    isIconOnly: true,
  } as const;
  const idle = button({ ...common, variant: "light", color: "default", class: "font-medium" });
  const current = button({ ...common, variant: "solid", color: color ?? "primary" });
  // Plain buttons, so the Button's data-disabled styles do not apply: dimmed, and no pointer or hover.
  const off = "disabled:pointer-events-none disabled:opacity-(--cennge-disabled-opacity)";

  return (
    <nav ref={ref} aria-label={ariaLabel} className={cn("flex", className)} {...rest}>
      <ul className="flex flex-wrap items-center gap-1">
        {showControls ? (
          <li>
            <button type="button" aria-label="Previous page" disabled={isDisabled || page <= 1} onClick={() => go(page - 1)} className={cn(idle, off)}>
              <Arrow direction="left" />
            </button>
          </li>
        ) : null}
        {getPageItems(total, page, siblings).map((item) =>
          typeof item === "number" ? (
            <li key={item}>
              <button
                type="button"
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                disabled={isDisabled}
                onClick={() => go(item)}
                className={cn(item === page ? current : idle, off, "tabular-nums")}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} aria-hidden="true" className="flex w-8 items-center justify-center text-muted select-none">
              …
            </li>
          ),
        )}
        {showControls ? (
          <li>
            <button type="button" aria-label="Next page" disabled={isDisabled || page >= total} onClick={() => go(page + 1)} className={cn(idle, off)}>
              <Arrow direction="right" />
            </button>
          </li>
        ) : null}
      </ul>
    </nav>
  );
});
