/* Shared look for Select and Combobox popups. Internal, not exported from the package. */

export const popoverClass = [
  "z-50 overflow-y-auto rounded-medium border border-border bg-surface-3 p-1.5 text-foreground shadow-floating outline-none",
  "[scrollbar-color:var(--cennge-border)_transparent] scrollbar-thin",
  "data-[state=open]:animate-cennge-pop-in data-[state=closed]:animate-cennge-pop-out motion-reduce:animate-none",
].join(" ");

export const optionClass = [
  "relative flex w-full cursor-pointer items-center gap-2.5 rounded-small py-2 pr-8 pl-2.5 text-sm text-foreground outline-none select-none",
  "transition-colors duration-(--cennge-duration-fast) motion-reduce:transition-none",
  "data-[highlighted]:bg-default-bg data-[active]:bg-default-bg",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-(--cennge-disabled-opacity)",
].join(" ");

export const optionCheckClass = "absolute right-2.5 flex items-center text-primary-text";

export const groupLabelClass = "px-2.5 pt-2 pb-1 text-xs font-semibold text-muted";

export function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.75" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}
