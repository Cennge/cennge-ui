import * as React from "react";
import { DropdownMenu } from "radix-ui";
import { tv } from "../../utils/tv";
import { cn } from "../../utils/cn";
import type { CenngeColor } from "../../types";

/* ------------------------------------------------------------------ root */

export interface DropdownProps {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Blocks the rest of the page while open. Turn off when a menu item opens a Dialog,
   * so the two modal layers do not fight over pointer events.
   * @default true
   */
  isModal?: boolean;
  children?: React.ReactNode;
}

export function Dropdown({ isOpen, defaultOpen, onOpenChange, isModal = true, children }: DropdownProps) {
  return (
    <DropdownMenu.Root open={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={isModal}>
      {children}
    </DropdownMenu.Root>
  );
}

/** Wraps the element that opens the menu (usually a Button). */
export const DropdownTrigger = React.forwardRef<HTMLButtonElement, { children: React.ReactElement }>(
  function DropdownTrigger({ children, ...rest }, ref) {
    return (
      <DropdownMenu.Trigger ref={ref} asChild {...rest}>
        {children}
      </DropdownMenu.Trigger>
    );
  },
);

/* --------------------------------------------------------------- content */

export interface DropdownContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default "bottom" */
  placement?: "top" | "right" | "bottom" | "left";
  /** @default "start" */
  align?: "start" | "center" | "end";
  /** Gap from the trigger, in px. @default 6 */
  offset?: number;
  container?: HTMLElement | null;
}

export const DropdownContent = React.forwardRef<HTMLDivElement, DropdownContentProps>(function DropdownContent(
  { placement = "bottom", align = "start", offset = 6, container, className, ...rest },
  ref,
) {
  return (
    <DropdownMenu.Portal container={container}>
      <DropdownMenu.Content
        ref={ref}
        side={placement}
        align={align}
        sideOffset={offset}
        collisionPadding={8}
        className={cn(
          menuContentClass,
          "max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin)",
          className,
        )}
        {...rest}
      />
    </DropdownMenu.Portal>
  );
});

/* ------------------------------------------------- shared with ContextMenu */

export const menuContentClass = [
  "z-50 min-w-52 overflow-y-auto rounded-medium border border-border bg-surface-3 p-1.5 text-foreground shadow-floating outline-none",
  "data-[state=open]:animate-cennge-pop-in data-[state=closed]:animate-cennge-pop-out motion-reduce:animate-none",
].join(" ");

export function MenuItemInner({
  startContent,
  description,
  shortcut,
  endContent,
  children,
}: Pick<DropdownItemProps, "startContent" | "description" | "shortcut" | "endContent" | "children">) {
  return (
    <>
      {startContent ? <span className="flex shrink-0 items-center opacity-80">{startContent}</span> : null}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{children}</span>
        {description ? <span className="truncate text-xs text-muted">{description}</span> : null}
      </span>
      {shortcut ? <kbd className="ml-auto pl-3 font-sans text-xs text-muted">{shortcut}</kbd> : null}
      {endContent}
    </>
  );
}

/* ------------------------------------------------------------------ item */

export const menuItem = tv({
  base: [
    "relative flex w-full cursor-pointer items-center gap-2.5 rounded-small px-2.5 py-2 text-sm outline-none select-none",
    "transition-colors duration-(--cennge-duration-fast) motion-reduce:transition-none",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-(--cennge-disabled-opacity)",
  ],
  variants: {
    color: {
      default: "text-foreground data-[highlighted]:bg-default-bg",
      primary: "text-foreground data-[highlighted]:bg-primary-bg data-[highlighted]:text-primary-text",
      secondary: "text-foreground data-[highlighted]:bg-secondary-bg data-[highlighted]:text-secondary-text",
      success: "text-foreground data-[highlighted]:bg-success-bg data-[highlighted]:text-success-text",
      warning: "text-foreground data-[highlighted]:bg-warning-bg data-[highlighted]:text-warning-text",
      // Destructive actions stay red at rest, not only on hover.
      danger: "text-danger-text data-[highlighted]:bg-danger-bg",
      info: "text-foreground data-[highlighted]:bg-info-bg data-[highlighted]:text-info-text",
    },
  },
  defaultVariants: { color: "default" },
});

export interface DropdownItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "onSelect"> {
  /** Highlight colour. Use `danger` for destructive actions. @default "default" */
  color?: CenngeColor;
  /** Called when the item is chosen by click, Enter or Space. */
  onAction?: () => void;
  /** Second line under the label. */
  description?: React.ReactNode;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  /** Keyboard hint shown on the right, e.g. "⌘K". */
  shortcut?: React.ReactNode;
  isDisabled?: boolean;
  /** Keep the menu open after this item is chosen. @default false */
  keepOpen?: boolean;
}

export const DropdownItem = React.forwardRef<HTMLDivElement, DropdownItemProps>(function DropdownItem(
  {
    color = "default",
    onAction,
    description,
    startContent,
    endContent,
    shortcut,
    isDisabled = false,
    keepOpen = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <DropdownMenu.Item
      ref={ref}
      disabled={isDisabled}
      onSelect={(event) => {
        if (keepOpen) event.preventDefault();
        onAction?.();
      }}
      className={menuItem({ color, className })}
      {...rest}
    >
      <MenuItemInner startContent={startContent} description={description} shortcut={shortcut} endContent={endContent}>
        {children}
      </MenuItemInner>
    </DropdownMenu.Item>
  );
});

/* ----------------------------------------------------------------- parts */

export const DropdownLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DropdownLabel({ className, ...rest }, ref) {
    return (
      <DropdownMenu.Label
        ref={ref}
        className={cn("px-2.5 pt-2 pb-1 text-xs font-semibold text-muted", className)}
        {...rest}
      />
    );
  },
);

export const DropdownSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DropdownSeparator({ className, ...rest }, ref) {
    return <DropdownMenu.Separator ref={ref} className={cn("-mx-1.5 my-1.5 h-px bg-border", className)} {...rest} />;
  },
);

export const DropdownGroup = DropdownMenu.Group;
