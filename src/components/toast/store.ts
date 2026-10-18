import type { ReactNode } from "react";
import type { CenngeColor } from "../../types";

export interface ToastAction {
  label: ReactNode;
  onClick: () => void;
}

export interface ToastOptions {
  /** Reuse an id to update an existing toast instead of adding a new one. */
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  /** @default "default" */
  color?: CenngeColor;
  /** Auto-close delay in ms. `Infinity` keeps it open. Defaults to the Toaster's `duration`. */
  duration?: number;
  action?: ToastAction;
  /** Replace the colour's default icon; `false` hides it. */
  icon?: ReactNode | false;
  /** Shows a spinner instead of the icon and never auto-closes. Used by `toast.promise`. */
  isLoading?: boolean;
  onClose?: () => void;
}

export interface ToastRecord extends ToastOptions {
  id: string;
  isOpen: boolean;
}

type Listener = () => void;

let records: ToastRecord[] = [];
const listeners = new Set<Listener>();
let counter = 0;

function emit() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getToasts(): ToastRecord[] {
  return records;
}

function upsert(options: ToastOptions): string {
  const id = options.id ?? `toast-${++counter}`;
  const existing = records.find((r) => r.id === id);
  records = existing
    ? records.map((r) => (r.id === id ? { ...r, ...options, id, isOpen: true } : r))
    : [...records, { ...options, id, isOpen: true }];
  emit();
  return id;
}

/** Close with the exit animation; the record is dropped once it has finished. */
export function dismiss(id?: string) {
  records = records.map((r) => (id === undefined || r.id === id ? { ...r, isOpen: false } : r));
  emit();
  setTimeout(() => {
    records = records.filter((r) => r.isOpen);
    emit();
  }, 300);
}

type Message = ReactNode | ToastOptions;

function isOptions(message: Message): message is ToastOptions {
  return typeof message === "object" && message !== null && !("$$typeof" in message) && !Array.isArray(message);
}

function normalize(message: Message, options?: ToastOptions): ToastOptions {
  return isOptions(message) ? { ...message, ...options } : { title: message, ...options };
}

function create(color: CenngeColor | undefined) {
  return (message: Message, options?: ToastOptions) => {
    const merged = normalize(message, options);
    return upsert(color ? { ...merged, color } : merged);
  };
}

export interface PromiseMessages<T> {
  loading: ReactNode;
  success: ReactNode | ((value: T) => ReactNode);
  error: ReactNode | ((error: unknown) => ReactNode);
}

/**
 * Show a notification. Works anywhere, also outside React components.
 *
 *   toast("Saved")
 *   toast.success("Deployed", { description: "v1.2.0 is live" })
 *   toast.promise(save(), { loading: "Saving…", success: "Saved", error: "Failed" })
 */
export const toast = Object.assign(create(undefined), {
  success: create("success"),
  danger: create("danger"),
  error: create("danger"),
  warning: create("warning"),
  info: create("info"),
  dismiss,
  promise<T>(promise: Promise<T>, messages: PromiseMessages<T>, options?: ToastOptions): Promise<T> {
    const id = upsert({ ...options, title: messages.loading, isLoading: true, duration: Infinity });
    promise.then(
      (value) => {
        const title = typeof messages.success === "function" ? messages.success(value) : messages.success;
        upsert({ ...options, id, title, color: "success", isLoading: false, duration: options?.duration });
      },
      (error: unknown) => {
        const title = typeof messages.error === "function" ? messages.error(error) : messages.error;
        upsert({ ...options, id, title, color: "danger", isLoading: false, duration: options?.duration });
      },
    );
    return promise;
  },
});
