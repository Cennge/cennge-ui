import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
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
    overlay: [
      "fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]",
      "data-[state=open]:animate-cennge-fade-in data-[state=closed]:animate-cennge-fade-out motion-reduce:animate-none",
    ],
    content: [
      "fixed z-50 flex flex-col border-border bg-surface-2 text-foreground shadow-floating outline-none",
      "data-[state=open]:animate-cennge-slide-in data-[state=closed]:animate-cennge-slide-out motion-reduce:animate-none",
    ],
    closeButton: [
      "absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-full text-muted",
      "transition-colors hover:bg-default-bg hover:text-foreground",
      "outline-none focus-visible:outline-2 focus-visible:outline-ring",
    ],
    handle: "mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-default-highlight",
  },
  variants: {
    placement: {
      right: { content: "inset-y-0 right-0 h-full w-full border-l [--cennge-slide-x:100%] sm:rounded-l-large" },
      left: { content: "inset-y-0 left-0 h-full w-full border-r [--cennge-slide-x:-100%] sm:rounded-r-large" },
      top: { content: "inset-x-0 top-0 max-h-[85dvh] border-b [--cennge-slide-y:-100%] rounded-b-large" },
      bottom: { content: "inset-x-0 bottom-0 max-h-[85dvh] border-t [--cennge-slide-y:100%] rounded-t-large" },
    },
    size: { sm: {}, md: {}, lg: {} },
  },
  compoundVariants: [
    { placement: ["left", "right"], size: "sm", class: { content: "max-w-xs" } },
    { placement: ["left", "right"], size: "md", class: { content: "max-w-md" } },
    { placement: ["left", "right"], size: "lg", class: { content: "max-w-2xl" } },
  ],
});

type DrawerSlots = "overlay" | "content" | "closeButton";

export interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default "right" */
  placement?: DrawerPlacement;
  /** Width for left/right drawers. @default "md" */
  size?: "sm" | "md" | "lg";
  /** @default false */
  hideCloseButton?: boolean;
  classNames?: Partial<Record<DrawerSlots, string>>;
  container?: HTMLElement | null;
}

export const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(function DrawerContent(
  { placement = "right", size = "md", hideCloseButton = false, classNames, className, container, children, ...rest },
  ref,
) {
  const slots = drawer({ placement, size });
  return (
    <DialogPrimitive.Portal container={container}>
      <DialogPrimitive.Overlay className={slots.overlay({ class: classNames?.overlay })} />
      <DialogPrimitive.Content ref={ref} className={slots.content({ class: [classNames?.content, className] })} {...rest}>
        {placement === "bottom" ? <div aria-hidden="true" className={slots.handle()} /> : null}
        {children}
        {hideCloseButton ? null : (
          <DialogPrimitive.Close aria-label="Close" className={slots.closeButton({ class: classNames?.closeButton })}>
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
