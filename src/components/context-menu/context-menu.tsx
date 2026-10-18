import * as React from "react";
import { ContextMenu as ContextMenuPrimitive } from "radix-ui";
import { cn } from "../../utils/cn";
import { MenuItemInner, menuContentClass, menuItem, type DropdownItemProps } from "../dropdown/dropdown";

export interface ContextMenuProps {
  onOpenChange?: (isOpen: boolean) => void;
  /** Blocks the rest of the page while open. @default true */
  isModal?: boolean;
  children?: React.ReactNode;
}

/** A menu on right click (or long press on touch devices). Items work like DropdownItem. */
export function ContextMenu({ onOpenChange, isModal = true, children }: ContextMenuProps) {
  return (
    <ContextMenuPrimitive.Root onOpenChange={onOpenChange} modal={isModal}>
      {children}
    </ContextMenuPrimitive.Root>
  );
}

export interface ContextMenuTriggerProps {
  /** The area that reacts to right click. A single element that accepts a ref. */
  children: React.ReactElement;
  isDisabled?: boolean;
}

export const ContextMenuTrigger = React.forwardRef<HTMLElement, ContextMenuTriggerProps>(function ContextMenuTrigger(
  { children, isDisabled, ...rest },
  ref,
) {
  return (
    <ContextMenuPrimitive.Trigger ref={ref} asChild disabled={isDisabled} {...rest}>
      {children}
    </ContextMenuPrimitive.Trigger>
  );
});

export interface ContextMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  container?: HTMLElement | null;
}

export const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(function ContextMenuContent(
  { container, className, ...rest },
  ref,
) {
  return (
    <ContextMenuPrimitive.Portal container={container}>
      <ContextMenuPrimitive.Content
        ref={ref}
        collisionPadding={8}
        className={cn(
          menuContentClass,
          "max-h-(--radix-context-menu-content-available-height) origin-(--radix-context-menu-content-transform-origin)",
          className,
        )}
        {...rest}
      />
    </ContextMenuPrimitive.Portal>
  );
});

export type ContextMenuItemProps = DropdownItemProps;

export const ContextMenuItem = React.forwardRef<HTMLDivElement, ContextMenuItemProps>(function ContextMenuItem(
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
    <ContextMenuPrimitive.Item
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
    </ContextMenuPrimitive.Item>
  );
});

export const ContextMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function ContextMenuLabel({ className, ...rest }, ref) {
    return (
      <ContextMenuPrimitive.Label
        ref={ref}
        className={cn("px-2.5 pt-2 pb-1 text-xs font-semibold text-muted", className)}
        {...rest}
      />
    );
  },
);

export const ContextMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function ContextMenuSeparator({ className, ...rest }, ref) {
    return <ContextMenuPrimitive.Separator ref={ref} className={cn("-mx-1.5 my-1.5 h-px bg-border", className)} {...rest} />;
  },
);

export const ContextMenuGroup = ContextMenuPrimitive.Group;
