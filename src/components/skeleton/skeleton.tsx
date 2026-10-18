import * as React from "react";
import { cn } from "../../utils/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show children instead of the placeholder once data is ready. */
  isLoaded?: boolean;
}

/**
 * Placeholder with a soft shimmer. Size it with classes (`h-4 w-32`, `size-10 rounded-full`),
 * or wrap real content and flip `isLoaded` to keep the layout identical.
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { isLoaded = false, className, children, ...rest },
  ref,
) {
  if (isLoaded) return <>{children}</>;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-small bg-surface-3",
        "after:absolute after:inset-0 after:animate-cennge-shimmer after:content-['']",
        "after:bg-linear-to-r after:from-transparent after:via-foreground/6 after:to-transparent",
        "motion-reduce:after:animate-none",
        // Children only reserve space while loading.
        "*:invisible",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
