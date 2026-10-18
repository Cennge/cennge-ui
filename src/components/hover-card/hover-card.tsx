import * as React from "react";
import { HoverCard as HoverCardPrimitive } from "radix-ui";
import { cn } from "../../utils/cn";

export interface HoverCardProps {
  /** Delay before opening, ms. @default 500 */
  openDelay?: number;
  /** Delay before closing, ms. @default 200 */
  closeDelay?: number;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  children?: React.ReactNode;
}

/**
 * A preview on hover, e.g. a user profile behind an @mention.
 * Hover does not exist on touch screens and is hard to reach by keyboard,
 * so put only extra information here; the trigger link must work on its own.
 */
export function HoverCard({ openDelay = 500, closeDelay = 200, isOpen, defaultOpen, onOpenChange, children }: HoverCardProps) {
  return (
    <HoverCardPrimitive.Root
      openDelay={openDelay}
      closeDelay={closeDelay}
      open={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {children}
    </HoverCardPrimitive.Root>
  );
}

/** Wraps the element that shows the card on hover, usually a link. */
export const HoverCardTrigger = React.forwardRef<HTMLAnchorElement, { children: React.ReactElement }>(
  function HoverCardTrigger({ children, ...rest }, ref) {
    return (
      <HoverCardPrimitive.Trigger ref={ref} asChild {...rest}>
        {children}
      </HoverCardPrimitive.Trigger>
    );
  },
);

export interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default "bottom" */
  placement?: "top" | "right" | "bottom" | "left";
  /** @default "center" */
  align?: "start" | "center" | "end";
  /** @default 8 */
  offset?: number;
  /** @default false */
  showArrow?: boolean;
  container?: HTMLElement | null;
}

export const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(function HoverCardContent(
  { placement = "bottom", align = "center", offset = 8, showArrow = false, container, className, children, ...rest },
  ref,
) {
  return (
    <HoverCardPrimitive.Portal container={container}>
      <HoverCardPrimitive.Content
        ref={ref}
        side={placement}
        align={align}
        sideOffset={offset}
        collisionPadding={8}
        className={cn(
          "z-50 w-72 max-w-[calc(100vw-1rem)] rounded-large border border-border bg-surface-3 p-4 text-sm text-foreground",
          "shadow-floating outline-none origin-(--radix-hover-card-content-transform-origin)",
          "data-[state=open]:animate-cennge-pop-in data-[state=closed]:animate-cennge-pop-out motion-reduce:animate-none",
          className,
        )}
        {...rest}
      >
        {children}
        {showArrow ? <HoverCardPrimitive.Arrow width={12} height={6} className="fill-surface-3" /> : null}
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Portal>
  );
});
