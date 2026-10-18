import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { cn } from "../../utils/cn";

export interface PopoverProps {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Trap focus and block the page while open. @default false */
  isModal?: boolean;
  children?: React.ReactNode;
}

export function Popover({ isOpen, defaultOpen, onOpenChange, isModal = false, children }: PopoverProps) {
  return (
    <PopoverPrimitive.Root open={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={isModal}>
      {children}
    </PopoverPrimitive.Root>
  );
}

/** Wraps the element that toggles the popover (usually a Button). */
export const PopoverTrigger = React.forwardRef<HTMLButtonElement, { children: React.ReactElement }>(
  function PopoverTrigger({ children, ...rest }, ref) {
    return (
      <PopoverPrimitive.Trigger ref={ref} asChild {...rest}>
        {children}
      </PopoverPrimitive.Trigger>
    );
  },
);

/** Wraps an element that closes the popover. */
export const PopoverClose = React.forwardRef<HTMLButtonElement, { children: React.ReactElement }>(
  function PopoverClose({ children, ...rest }, ref) {
    return (
      <PopoverPrimitive.Close ref={ref} asChild {...rest}>
        {children}
      </PopoverPrimitive.Close>
    );
  },
);

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default "bottom" */
  placement?: "top" | "right" | "bottom" | "left";
  /** @default "center" */
  align?: "start" | "center" | "end";
  /** Gap from the trigger, in px. @default 8 */
  offset?: number;
  /** @default false */
  showArrow?: boolean;
  container?: HTMLElement | null;
}

export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(
  { placement = "bottom", align = "center", offset = 8, showArrow = false, container, className, children, ...rest },
  ref,
) {
  return (
    <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Content
        ref={ref}
        side={placement}
        align={align}
        sideOffset={offset}
        collisionPadding={8}
        className={cn(
          "z-50 max-w-[calc(100vw-1rem)] rounded-large border border-border bg-surface-3 p-4 text-sm text-foreground",
          "shadow-floating outline-none origin-(--radix-popover-content-transform-origin)",
          "data-[state=open]:animate-cennge-pop-in data-[state=closed]:animate-cennge-pop-out motion-reduce:animate-none",
          className,
        )}
        {...rest}
      >
        {children}
        {showArrow ? <PopoverPrimitive.Arrow width={12} height={6} className="fill-surface-3" /> : null}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
});
