import * as React from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";
import { tv } from "../../utils/tv";
import { cn } from "../../utils/cn";
import type { CenngeColor, CenngeRadius } from "../../types";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

const avatar = tv({
  slots: {
    base: "relative inline-flex shrink-0 items-center justify-center overflow-hidden align-middle font-semibold select-none",
    image: "size-full object-cover",
    fallback: "flex size-full items-center justify-center",
  },
  variants: {
    size: {
      sm: { base: "size-8 text-xs" },
      md: { base: "size-10 text-sm" },
      lg: { base: "size-12 text-base" },
      xl: { base: "size-16 text-xl" },
    },
    radius: {
      none: { base: "rounded-none" },
      sm: { base: "rounded-small" },
      md: { base: "rounded-medium" },
      lg: { base: "rounded-large" },
      full: { base: "rounded-full" },
    },
    color: {
      default: { fallback: "bg-surface-4 text-foreground" },
      primary: { fallback: "bg-primary-bg text-primary-text" },
      secondary: { fallback: "bg-secondary-bg text-secondary-text" },
      success: { fallback: "bg-success-bg text-success-text" },
      warning: { fallback: "bg-warning-bg text-warning-text" },
      danger: { fallback: "bg-danger-bg text-danger-text" },
      info: { fallback: "bg-info-bg text-info-text" },
    },
    isBordered: {
      true: { base: "ring-2 ring-surface-1 ring-offset-0" },
    },
  },
  defaultVariants: { size: "md", radius: "full", color: "default", isBordered: false },
});

function initials(name?: string): string {
  if (!name) return "";
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? `${parts[0]![0]}${parts[parts.length - 1]![0]}` : (parts[0] ?? "").slice(0, 2);
  return letters.toUpperCase();
}

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  src?: string;
  /** Used for the alt text and the initials fallback. */
  name?: string;
  alt?: string;
  /** Shown while the image loads or when it fails. Defaults to the initials. */
  fallback?: React.ReactNode;
  /** @default "md" */
  size?: AvatarSize;
  /** @default "full" */
  radius?: CenngeRadius;
  /** Fallback colour. @default "default" */
  color?: CenngeColor;
  /** Ring in the page colour; useful in overlapping groups. */
  isBordered?: boolean;
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, name, alt, fallback, size = "md", radius = "full", color = "default", isBordered = false, className, ...rest },
  ref,
) {
  const slots = avatar({ size, radius, color, isBordered });
  return (
    <AvatarPrimitive.Root ref={ref} className={slots.base({ class: className })} {...rest}>
      {src ? <AvatarPrimitive.Image src={src} alt={alt ?? name ?? ""} className={slots.image()} /> : null}
      {/* Small delay avoids a flash of initials when the image is cached. */}
      <AvatarPrimitive.Fallback delayMs={src ? 300 : undefined} className={slots.fallback()} aria-label={src ? undefined : name}>
        {fallback ?? initials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
});

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show at most this many avatars, then a "+N" counter. */
  max?: number;
  /** @default "md" */
  size?: AvatarSize;
}

/** Overlapping stack of avatars. Pass `isBordered` on the avatars for separation. */
export function AvatarGroup({ max, size = "md", className, children, ...rest }: AvatarGroupProps) {
  const items = React.Children.toArray(children);
  const shown = max ? items.slice(0, max) : items;
  const hidden = items.length - shown.length;
  return (
    <div className={cn("flex items-center -space-x-2", className)} {...rest}>
      {shown}
      {hidden > 0 ? <Avatar size={size} isBordered fallback={`+${hidden}`} aria-label={`${hidden} more`} /> : null}
    </div>
  );
}
