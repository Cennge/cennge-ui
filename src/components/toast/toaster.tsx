import * as React from "react";
import { Toast as ToastPrimitive } from "radix-ui";
import { tv } from "../../utils/tv";
import { Spinner } from "../spinner";
import type { CenngeColor } from "../../types";
import { dismiss, getToasts, subscribe, type ToastRecord } from "./store";

export type ToastPlacement = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

/* React 17 has no useSyncExternalStore: subscribe in an effect. */
function useToasts(): ToastRecord[] {
  const [items, setItems] = React.useState(getToasts);
  React.useEffect(() => {
    setItems(getToasts());
    return subscribe(() => setItems(getToasts()));
  }, []);
  return items;
}

const viewport = tv({
  base: [
    "fixed z-[100] m-0 flex w-full max-w-[24rem] list-none gap-2 p-4 outline-none",
    // Phones: full width with equal side margins, whatever the placement.
    "max-sm:right-0 max-sm:left-0 max-sm:max-w-none max-sm:translate-x-0",
  ],
  variants: {
    placement: {
      "top-left": "top-0 left-0 flex-col-reverse [--cennge-toast-from:-16px]",
      "top-center": "top-0 left-1/2 -translate-x-1/2 flex-col-reverse [--cennge-toast-from:-16px]",
      "top-right": "top-0 right-0 flex-col-reverse [--cennge-toast-from:-16px]",
      "bottom-left": "bottom-0 left-0 flex-col",
      "bottom-center": "bottom-0 left-1/2 -translate-x-1/2 flex-col",
      "bottom-right": "right-0 bottom-0 flex-col",
    },
  },
});

const toastStyles = tv({
  slots: {
    root: [
      "group relative flex w-full items-start gap-3 rounded-large border border-border bg-surface-3 p-4 pr-10",
      "text-foreground shadow-floating",
      "data-[state=open]:animate-cennge-toast-in data-[state=closed]:animate-cennge-toast-out motion-reduce:animate-none",
      "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:translate-y-0 data-[swipe=cancel]:transition-transform",
      "data-[swipe=end]:animate-cennge-toast-out",
    ],
    icon: "mt-px flex size-6 shrink-0 items-center justify-center rounded-full",
    title: "text-sm leading-6 font-semibold",
    description: "text-sm text-muted",
    action: [
      "mt-2 inline-flex h-7 cursor-pointer items-center rounded-small px-2.5 text-xs font-semibold",
      "bg-surface-4 inset-shadow-tactile transition-[filter,transform] hover:brightness-110 active:scale-[0.97]",
      "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring",
    ],
    close: [
      "absolute top-3 right-3 flex size-6 cursor-pointer items-center justify-center rounded-full text-muted",
      "opacity-70 transition hover:bg-default-bg hover:text-foreground hover:opacity-100",
      "outline-none focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring",
    ],
  },
  variants: {
    swipe: {
      x: { root: "data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)" },
      y: { root: "data-[swipe=move]:translate-y-(--radix-toast-swipe-move-y)" },
    },
    color: {
      default: { icon: "bg-default-bg text-default-text" },
      primary: { icon: "bg-primary-bg text-primary-text" },
      secondary: { icon: "bg-secondary-bg text-secondary-text" },
      success: { icon: "bg-success-bg text-success-text" },
      warning: { icon: "bg-warning-bg text-warning-text" },
      danger: { icon: "bg-danger-bg text-danger-text" },
      info: { icon: "bg-info-bg text-info-text" },
    },
  },
});

const iconPaths: Partial<Record<CenngeColor, string>> = {
  success: "M5 12.5l4.5 4.5L19 7.5",
  danger: "M15 9l-6 6M9 9l6 6",
  warning: "M12 8v5M12 16.5v.5",
  info: "M12 11v6M12 7.5v.5",
};

function ColorIcon({ color }: { color: CenngeColor }) {
  const d = iconPaths[color];
  if (!d) return null;
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

export interface ToasterProps {
  /** @default "bottom-right" */
  placement?: ToastPlacement;
  /** Default auto-close delay, ms. @default 5000 */
  duration?: number;
  /** Most toasts on screen at once; older ones wait. @default 4 */
  max?: number;
  /** Screen-reader name of the region. Press F8 to jump to it. @default "Notifications" */
  label?: string;
  className?: string;
}

/** Mount once near the root of the app. Then call `toast()` from anywhere. */
export function Toaster({
  placement = "bottom-right",
  duration = 5000,
  max = 4,
  label = "Notifications",
  className,
}: ToasterProps) {
  const items = useToasts();
  const swipeDirection = placement.endsWith("right")
    ? "right"
    : placement.endsWith("left")
      ? "left"
      : placement.startsWith("top")
        ? "up"
        : "down";
  const swipe = swipeDirection === "left" || swipeDirection === "right" ? "x" : "y";
  const visible = items.slice(-max);

  return (
    <ToastPrimitive.Provider duration={duration} swipeDirection={swipeDirection} label={label}>
      {visible.map((item) => {
        const color = item.color ?? "default";
        const slots = toastStyles({ color, swipe });
        const icon =
          item.icon === false ? null : item.isLoading ? (
            <Spinner size="sm" />
          ) : (
            (item.icon ?? <ColorIcon color={color} />)
          );
        return (
          <ToastPrimitive.Root
            key={item.id}
            open={item.isOpen}
            duration={item.isLoading ? Infinity : item.duration}
            onOpenChange={(open) => {
              if (!open) {
                dismiss(item.id);
                item.onClose?.();
              }
            }}
            data-slot="toast"
            data-color={color}
            className={slots.root()}
          >
            {icon && (item.isLoading || item.icon || iconPaths[color]) ? (
              <span className={slots.icon()}>{icon}</span>
            ) : null}
            <div className="flex min-w-0 flex-1 flex-col">
              {item.title ? <ToastPrimitive.Title className={slots.title()}>{item.title}</ToastPrimitive.Title> : null}
              {item.description ? (
                <ToastPrimitive.Description className={slots.description()}>{item.description}</ToastPrimitive.Description>
              ) : null}
              {item.action ? (
                <ToastPrimitive.Action
                  altText={typeof item.action.label === "string" ? item.action.label : "Action"}
                  onClick={item.action.onClick}
                  className={`${slots.action()} self-start`}
                >
                  {item.action.label}
                </ToastPrimitive.Action>
              ) : null}
            </div>
            <ToastPrimitive.Close aria-label="Close" className={slots.close()}>
              <CloseIcon />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        );
      })}
      <ToastPrimitive.Viewport className={viewport({ placement, className })} />
    </ToastPrimitive.Provider>
  );
}
