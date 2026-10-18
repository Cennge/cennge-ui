import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import { tv } from "../../utils/tv";
import { useCenngeDefaults } from "../../provider";
import type { CenngeColor } from "../../types";

const tooltip = tv({
  slots: {
    content: [
      "z-50 max-w-xs rounded-small px-2.5 py-1.5 text-xs leading-snug font-medium shadow-floating select-none",
      "origin-(--radix-tooltip-content-transform-origin)",
      "data-[state=delayed-open]:animate-cennge-pop-in data-[state=instant-open]:animate-cennge-pop-in",
      "data-[state=closed]:animate-cennge-pop-out motion-reduce:animate-none",
    ],
    arrow: "",
  },
  variants: {
    color: {
      default: { content: "border border-border bg-surface-4 text-foreground", arrow: "fill-surface-4" },
      primary: { content: "bg-primary text-primary-foreground", arrow: "fill-primary" },
      secondary: { content: "bg-secondary text-secondary-foreground", arrow: "fill-secondary" },
      success: { content: "bg-success text-success-foreground", arrow: "fill-success" },
      warning: { content: "bg-warning text-warning-foreground", arrow: "fill-warning" },
      danger: { content: "bg-danger text-danger-foreground", arrow: "fill-danger" },
      info: { content: "bg-info text-info-foreground", arrow: "fill-info" },
    },
  },
  defaultVariants: { color: "default" },
});

export interface TooltipProps {
  /** What the tooltip says. */
  content: React.ReactNode;
  /** The trigger. Must be a single element that accepts a ref (a Button, an <a>…). */
  children: React.ReactElement;
  /** @default "default" */
  color?: CenngeColor;
  /** @default "top" */
  placement?: "top" | "right" | "bottom" | "left";
  /** @default "center" */
  align?: "start" | "center" | "end";
  /** Gap between trigger and tooltip, in px. @default 6 */
  offset?: number;
  /** @default false */
  showArrow?: boolean;
  /** Delay before opening, in ms. Defaults to the provider's `tooltipDelay` (300). */
  delay?: number;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  isDisabled?: boolean;
  className?: string;
}

export function Tooltip({
  content,
  children,
  color = "default",
  placement = "top",
  align = "center",
  offset = 6,
  showArrow = false,
  delay,
  isOpen,
  defaultOpen,
  onOpenChange,
  isDisabled = false,
  className,
}: TooltipProps) {
  const { hasTooltipProvider } = useCenngeDefaults();
  if (isDisabled) return children;

  const slots = tooltip({ color });
  const root = (
    <TooltipPrimitive.Root open={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange} delayDuration={delay}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={placement}
          align={align}
          sideOffset={offset}
          collisionPadding={8}
          className={slots.content({ class: className })}
        >
          {content}
          {showArrow ? <TooltipPrimitive.Arrow width={10} height={5} className={slots.arrow()} /> : null}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );

  // Works without <CenngeProvider>: mount a local provider when no shared one exists.
  return hasTooltipProvider ? root : <TooltipPrimitive.Provider delayDuration={delay ?? 300}>{root}</TooltipPrimitive.Provider>;
}
