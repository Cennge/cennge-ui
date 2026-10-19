import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { tv } from "../../utils/tv";
import { cn } from "../../utils/cn";
import type { CenngeRadius } from "../../types";

/* ------------------------------------------------------------------ root */

export interface DialogProps {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Blocks interaction outside while open. @default true */
  isModal?: boolean;
  children?: React.ReactNode;
}

export function Dialog({ isOpen, defaultOpen, onOpenChange, isModal = true, children }: DialogProps) {
  return (
    <DialogPrimitive.Root open={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={isModal}>
      {children}
    </DialogPrimitive.Root>
  );
}

/** Wraps the element that opens the dialog (usually a Button). */
export const DialogTrigger = React.forwardRef<HTMLButtonElement, { children: React.ReactElement }>(
  function DialogTrigger({ children, ...rest }, ref) {
    return (
      <DialogPrimitive.Trigger ref={ref} asChild {...rest}>
        {children}
      </DialogPrimitive.Trigger>
    );
  },
);

/** Wraps an element that closes the dialog. */
export const DialogClose = React.forwardRef<HTMLButtonElement, { children: React.ReactElement }>(
  function DialogClose({ children, ...rest }, ref) {
    return (
      <DialogPrimitive.Close ref={ref} asChild {...rest}>
        {children}
      </DialogPrimitive.Close>
    );
  },
);

/*
 * Radix returns focus on close only to a Dialog.Trigger. A dialog opened from code (a menu item, a
 * shortcut, a menu button elsewhere) has none, and focus would fall to the page. Remember what had
 * focus on open and go back to it; with a trigger, Radix then moves focus there as before.
 * Internal: used by Dialog, Drawer and AlertDialog.
 */
export function useFocusReturn(
  onOpenAutoFocus?: (event: Event) => void,
  onCloseAutoFocus?: (event: Event) => void,
) {
  const previous = React.useRef<HTMLElement | null>(null);
  return {
    onOpenAutoFocus: (event: Event) => {
      const active = document.activeElement;
      previous.current = active instanceof HTMLElement && active !== document.body ? active : null;
      onOpenAutoFocus?.(event);
    },
    onCloseAutoFocus: (event: Event) => {
      onCloseAutoFocus?.(event);
      if (!event.defaultPrevented && previous.current?.isConnected) previous.current.focus();
    },
  };
}

/* --------------------------------------------------------------- content */

/** Shared with AlertDialog. Internal: not re-exported from the package. */
export const dialogStyles = tv({
  slots: {
    overlay: [
      "fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]",
      "data-[state=open]:animate-cennge-fade-in data-[state=closed]:animate-cennge-fade-out motion-reduce:animate-none",
    ],
    content: [
      "fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col",
      // Long content scrolls inside the body instead of overflowing the screen.
      "max-h-[calc(100dvh-2rem)] border border-border bg-surface-2 pb-6 text-foreground shadow-floating outline-none",
      "data-[state=open]:animate-cennge-dialog-in data-[state=closed]:animate-cennge-dialog-out motion-reduce:animate-none",
    ],
    closeButton: [
      "absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-full text-muted",
      "transition-colors hover:bg-default-bg hover:text-foreground",
      "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring",
    ],
  },
  variants: {
    size: {
      sm: { content: "max-w-sm" },
      md: { content: "max-w-md" },
      lg: { content: "max-w-lg" },
      xl: { content: "max-w-2xl" },
    },
    radius: {
      none: { content: "rounded-none" },
      sm: { content: "rounded-small" },
      md: { content: "rounded-medium" },
      lg: { content: "rounded-large" },
      full: { content: "rounded-[1.5rem]" },
    },
  },
  defaultVariants: { size: "md", radius: "lg" },
});

type DialogSlots = "overlay" | "content" | "closeButton";

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default "md" */
  size?: "sm" | "md" | "lg" | "xl";
  /** @default "lg" */
  radius?: CenngeRadius;
  /** @default false */
  hideCloseButton?: boolean;
  /** Close when clicking the backdrop. @default true */
  isDismissable?: boolean;
  /** Keep the dialog open on Escape. @default false */
  isKeyboardDismissDisabled?: boolean;
  classNames?: Partial<Record<DialogSlots, string>>;
  /** Mount the portal elsewhere (default: document.body). */
  container?: HTMLElement | null;
  /** Runs as the dialog opens and moves focus inside; `event.preventDefault()` to focus something else. */
  onOpenAutoFocus?: (event: Event) => void;
  /** Runs as the dialog closes and returns focus; `event.preventDefault()` to send focus elsewhere. */
  onCloseAutoFocus?: (event: Event) => void;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
  {
    size = "md",
    radius = "lg",
    hideCloseButton = false,
    isDismissable = true,
    isKeyboardDismissDisabled = false,
    classNames,
    className,
    container,
    onOpenAutoFocus,
    onCloseAutoFocus,
    children,
    ...rest
  },
  ref,
) {
  const slots = dialogStyles({ size, radius });
  const focusReturn = useFocusReturn(onOpenAutoFocus, onCloseAutoFocus);
  return (
    <DialogPrimitive.Portal container={container}>
      <DialogPrimitive.Overlay className={slots.overlay({ class: classNames?.overlay })} />
      <DialogPrimitive.Content
        ref={ref}
        {...focusReturn}
        className={slots.content({ class: [classNames?.content, className] })}
        onPointerDownOutside={isDismissable ? undefined : (event) => event.preventDefault()}
        onEscapeKeyDown={isKeyboardDismissDisabled ? (event) => event.preventDefault() : undefined}
        {...rest}
      >
        {children}
        {hideCloseButton ? null : (
          <DialogPrimitive.Close aria-label="Close" className={slots.closeButton({ class: classNames?.closeButton })}>
            <CloseIcon />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

/* ----------------------------------------------------------------- parts */

export const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DialogHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("flex flex-col gap-1 px-6 pt-6 pr-12", className)} {...rest} />;
  },
);

/** Required for screen readers. Hide it visually with `className="sr-only"` if the design has no title. */
export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function DialogTitle({ className, ...rest }, ref) {
    return <DialogPrimitive.Title ref={ref} className={cn("text-lg font-bold tracking-tight", className)} {...rest} />;
  },
);

export const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function DialogDescription({ className, ...rest }, ref) {
    return <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted", className)} {...rest} />;
  },
);

export const DialogBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DialogBody({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(
          "flex-1 overflow-y-auto px-6 pt-4 text-sm",
          "[scrollbar-color:var(--cennge-border)_transparent] scrollbar-thin",
          className,
        )} {...rest} />;
  },
);

export const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DialogFooter({ className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col-reverse gap-2 px-6 pt-4 sm:flex-row sm:justify-end", className)}
        {...rest}
      />
    );
  },
);
