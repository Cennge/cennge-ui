import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { cn } from "../../utils/cn";
import { useCenngeDefaults } from "../../provider";
import type { CenngeRadius } from "../../types";
import { Button, type ButtonProps } from "../button";
import { Spinner } from "../spinner";
import { DialogBody, DialogFooter, dialogStyles } from "../dialog/dialog";

/* ------------------------------------------------------------------ root */

// Any return value is fine; a promise keeps the dialog open until it settles.
type Action = () => unknown;

interface AlertDialogContextValue {
  isPending: boolean;
  runAction: (action: Action | undefined) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(null);

function useAlertDialog(part: string): AlertDialogContextValue {
  const context = React.useContext(AlertDialogContext);
  if (!context) throw new Error(`<${part}> must be used inside <AlertDialog>.`);
  return context;
}

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  typeof value === "object" && value !== null && typeof (value as PromiseLike<unknown>).then === "function";

export interface AlertDialogProps {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  children?: React.ReactNode;
}

/**
 * Asks the user to confirm or cancel, usually before something destructive. Unlike Dialog, a click
 * outside does not close it, there is no close button, and focus starts on Cancel.
 */
export function AlertDialog({ isOpen, defaultOpen = false, onOpenChange, children }: AlertDialogProps) {
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
  const open = isOpen ?? innerOpen;
  const [isPending, setIsPending] = React.useState(false);

  // An action's promise settles after later renders: read the current props, not the ones it started with.
  const latest = React.useRef({ isOpen, onOpenChange });
  latest.current = { isOpen, onOpenChange };
  const pending = React.useRef(false);
  const mounted = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const setOpen = (next: boolean) => {
    if (latest.current.isOpen === undefined) setInnerOpen(next);
    latest.current.onOpenChange?.(next);
  };
  const setPending = (value: boolean) => {
    pending.current = value;
    setIsPending(value);
  };

  const runAction = (action: Action | undefined) => {
    if (pending.current) return;
    const result = action?.();
    if (!isPromiseLike(result)) {
      setOpen(false);
      return;
    }
    setPending(true);
    Promise.resolve(result).then(
      () => {
        if (!mounted.current) return;
        setPending(false);
        setOpen(false);
      },
      // Stays open so the user can retry or cancel; showing the error is up to the action.
      () => {
        if (mounted.current) setPending(false);
      },
    );
  };

  return (
    <AlertDialogContext.Provider value={{ isPending, runAction }}>
      <AlertDialogPrimitive.Root
        open={open}
        // While an action runs, Escape and Cancel cannot close the dialog.
        onOpenChange={(next) => {
          if (!next && pending.current) return;
          setOpen(next);
        }}
      >
        {children}
      </AlertDialogPrimitive.Root>
    </AlertDialogContext.Provider>
  );
}

/** Wraps the element that opens the dialog (usually a Button). */
export const AlertDialogTrigger = React.forwardRef<HTMLButtonElement, { children: React.ReactElement }>(
  function AlertDialogTrigger({ children, ...rest }, ref) {
    return (
      <AlertDialogPrimitive.Trigger ref={ref} asChild {...rest}>
        {children}
      </AlertDialogPrimitive.Trigger>
    );
  },
);

/* --------------------------------------------------------------- content */

type AlertDialogSlots = "overlay" | "content";

export interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** @default "lg" */
  radius?: CenngeRadius;
  /**
   * Runs as the dialog opens and moves focus to Cancel. Call `event.preventDefault()` and focus
   * another element to start elsewhere, e.g. a confirmation field.
   */
  onOpenAutoFocus?: (event: Event) => void;
  classNames?: Partial<Record<AlertDialogSlots, string>>;
  /** Mount the portal elsewhere (default: document.body). */
  container?: HTMLElement | null;
}

export const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(function AlertDialogContent(
  { size = "md", radius = "lg", classNames, className, container, children, ...rest },
  ref,
) {
  const slots = dialogStyles({ size, radius });
  return (
    <AlertDialogPrimitive.Portal container={container}>
      <AlertDialogPrimitive.Overlay className={slots.overlay({ class: classNames?.overlay })} />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={slots.content({ class: [classNames?.content, className] })}
        {...rest}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  );
});

/* ----------------------------------------------------------------- parts */

export const AlertDialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function AlertDialogHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("flex flex-col gap-1 px-6 pt-6", className)} {...rest} />;
  },
);

/** Required: screen readers announce it when the dialog opens. */
export const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function AlertDialogTitle({ className, ...rest }, ref) {
    return (
      <AlertDialogPrimitive.Title ref={ref} className={cn("text-lg font-bold tracking-tight", className)} {...rest} />
    );
  },
);

/** Required: says what happens if the user confirms. Read out together with the title. */
export const AlertDialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function AlertDialogDescription({ className, ...rest }, ref) {
    return <AlertDialogPrimitive.Description ref={ref} className={cn("text-sm text-muted", className)} {...rest} />;
  },
);

export const AlertDialogBody = DialogBody;
export const AlertDialogFooter = DialogFooter;

/* --------------------------------------------------------------- buttons */

export type AlertDialogCancelProps = Omit<ButtonProps, "asChild">;

/** Closes the dialog. Focused when the dialog opens. Disabled while an action runs. */
export const AlertDialogCancel = React.forwardRef<HTMLButtonElement, AlertDialogCancelProps>(function AlertDialogCancel(
  { variant = "flat", isDisabled, ...rest },
  ref,
) {
  const { isPending } = useAlertDialog("AlertDialogCancel");
  return (
    <AlertDialogPrimitive.Cancel asChild>
      <Button ref={ref} variant={variant} isDisabled={isDisabled || isPending} {...rest} />
    </AlertDialogPrimitive.Cancel>
  );
});

export interface AlertDialogActionProps extends Omit<ButtonProps, "asChild" | "isLoading" | "onClick"> {
  /**
   * Runs on click, then the dialog closes. Return a promise to keep the dialog open with a spinner
   * until it settles: it closes when the promise resolves and stays open when it rejects.
   */
  onAction?: () => unknown;
}

/** Confirms. Pass `color="danger"` for destructive actions. */
export const AlertDialogAction = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(function AlertDialogAction(
  { onAction, color = "primary", size, startContent, spinner, ...rest },
  ref,
) {
  const defaults = useCenngeDefaults();
  const { isPending, runAction } = useAlertDialog("AlertDialogAction");
  return (
    <Button
      ref={ref}
      color={color}
      size={size}
      // Busy, yet still focusable: a disabled button would drop keyboard focus to the page.
      aria-disabled={isPending || undefined}
      aria-busy={isPending || undefined}
      data-loading={isPending || undefined}
      startContent={isPending ? (spinner ?? <Spinner size={size ?? defaults.size ?? "md"} />) : startContent}
      onClick={() => runAction(onAction)}
      {...rest}
    />
  );
});
