import { cn } from "cennge-ui/utils";

/**
 * The cennge mark, set before the name. One image used as a mask and painted in the colour of the text
 * around it, so it follows the theme and the inverted footer tile without a second file. The name beside it
 * says what it is, so it is hidden from screen readers.
 */
export function BrandMark({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("brand-mark", className)} />;
}
