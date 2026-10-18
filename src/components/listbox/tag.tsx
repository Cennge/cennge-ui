import * as React from "react";
import { cn } from "../../utils/cn";
import type { CenngeSize } from "../../types";
import { ClearIcon } from "./styles";

/* Removable tag shared by MultiSelect (Combobox) and TagsInput. Internal. */

const tagSizes: Record<CenngeSize, string> = {
  sm: "h-5 text-[11px]",
  md: "h-6 text-xs",
  lg: "h-7 text-sm",
};

export interface TagProps {
  children: React.ReactNode;
  /** Accessible name of the remove button, e.g. "Remove react". */
  removeLabel: string;
  onRemove: (event: React.MouseEvent<HTMLButtonElement>) => void;
  size: CenngeSize;
  isDisabled?: boolean;
  /** Short ring, e.g. to point at the tag a duplicate collided with. */
  isHighlighted?: boolean;
  className?: string;
  buttonRef?: React.Ref<HTMLButtonElement>;
  onButtonKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
}

export function Tag({
  children,
  removeLabel,
  onRemove,
  size,
  isDisabled,
  isHighlighted,
  className,
  buttonRef,
  onButtonKeyDown,
}: TagProps) {
  return (
    <span
      data-slot="tag"
      data-highlighted={isHighlighted || undefined}
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full bg-surface-4 pr-1 pl-2 font-semibold text-foreground",
        "transition-shadow duration-(--cennge-duration) data-[highlighted]:ring-2 data-[highlighted]:ring-warning",
        tagSizes[size],
        className,
      )}
    >
      <span className="truncate">{children}</span>
      <button
        ref={buttonRef}
        type="button"
        tabIndex={-1}
        aria-label={removeLabel}
        disabled={isDisabled}
        onClick={onRemove}
        onKeyDown={onButtonKeyDown}
        className={cn(
          "flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted",
          "hover:bg-default-bg hover:text-foreground",
          "outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
        )}
      >
        <ClearIcon />
      </button>
    </span>
  );
}
