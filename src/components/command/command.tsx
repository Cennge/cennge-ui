import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "../../utils/cn";
import { useId } from "../../utils/use-id";
import { dialogStyles, withinBackdrop } from "../dialog/dialog";
import { groupLabelClass, optionClass } from "../listbox/styles";

// useLayoutEffect warns during SSR on React 17/18; it only matters in the browser anyway.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/* ----------------------------------------------------------------- match */

const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase();

/** Every word of the query appears in the item's text or keywords, ignoring case and accents. */
export function commandMatches(query: string, text: string, keywords: readonly string[] = []): boolean {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = fold([text, ...keywords].join(" "));
  return words.every((word) => haystack.includes(word));
}

/* ------------------------------------------------------------------ root */

interface CommandContextValue {
  query: string;
  activeId: string | undefined;
  setActiveId: (id: string) => void;
  actions: React.MutableRefObject<Map<string, () => void>>;
}

const CommandContext = React.createContext<CommandContextValue | null>(null);

/* Set by CommandDialog: closes it after an item runs. */
const CloseContext = React.createContext<(() => void) | null>(null);

function useCommand(part: string): CommandContextValue {
  const context = React.useContext(CommandContext);
  if (!context) throw new Error(`<${part}> must be used inside <Command>.`);
  return context;
}

export interface CommandLabels {
  /** Read out after the query changes. @default (count) => `${count} results` */
  results: (count: number) => string;
}

type CommandSlots = "base" | "inputWrapper" | "input" | "list" | "empty";

export interface CommandProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Names the search field and the list. @default "Commands" */
  label?: string;
  /** @default "Type a command or search…" */
  placeholder?: string;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  /** Shown when nothing matches. @default "No results" */
  emptyContent?: React.ReactNode;
  /** Arrow keys wrap from the last item to the first. @default true */
  loop?: boolean;
  labels?: Partial<CommandLabels>;
  autoFocus?: boolean;
  classNames?: Partial<Record<CommandSlots, string>>;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * A searchable list of commands: type to filter, arrows to move, Enter to run. Focus stays in the
 * search field (WAI-ARIA combobox with a listbox). Use CommandDialog for a ⌘K palette.
 */
export const Command = React.forwardRef<HTMLDivElement, CommandProps>(function Command(props, ref) {
  const {
    label = "Commands",
    placeholder = "Type a command or search…",
    query: queryProp,
    defaultQuery = "",
    onQueryChange,
    emptyContent = "No results",
    loop = true,
    labels,
    autoFocus = false,
    className,
    classNames,
    children,
    ...rest
  } = props;

  const [innerQuery, setInnerQuery] = React.useState(defaultQuery);
  const query = queryProp ?? innerQuery;
  const setQuery = (next: string) => {
    if (queryProp === undefined) setInnerQuery(next);
    onQueryChange?.(next);
  };

  const listId = useId();
  const listRef = React.useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = React.useState<string | undefined>(undefined);
  const [count, setCount] = React.useState<number | null>(null);
  const actions = React.useRef(new Map<string, () => void>());

  const options = () =>
    Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])') ?? []);

  // After each render: keep the active option among those shown, the first one when the query changes.
  const lastQuery = React.useRef<string | null>(null);
  useIsomorphicLayoutEffect(() => {
    const shown = options();
    if (count !== shown.length) setCount(shown.length);
    const queryChanged = lastQuery.current !== query;
    lastQuery.current = query;
    if (queryChanged || !shown.some((option) => option.id === activeId)) {
      const first = shown[0]?.id;
      if (first !== activeId) setActiveId(first);
      listRef.current?.scrollTo?.({ top: 0 });
    }
  });

  const move = (step: 1 | -1) => {
    const shown = options();
    if (shown.length === 0) return;
    const index = shown.findIndex((option) => option.id === activeId);
    let next = index + step;
    if (next < 0) next = loop ? shown.length - 1 : 0;
    if (next >= shown.length) next = loop ? 0 : shown.length - 1;
    const target = shown[next];
    if (!target) return;
    setActiveId(target.id);
    target.scrollIntoView?.({ block: "nearest" });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    switch (event.key) {
      case "ArrowDown":
        move(1);
        break;
      case "ArrowUp":
        move(-1);
        break;
      case "Enter":
        if (activeId) actions.current.get(activeId)?.();
        break;
      case "Escape":
        if (!query) return; // nothing typed: let a dialog close
        event.stopPropagation(); // a typed query is cleared first
        setQuery("");
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  const results = labels?.results ?? ((n: number) => `${n} results`);

  return (
    <CommandContext.Provider value={{ query, activeId, setActiveId, actions }}>
      <div ref={ref} className={cn("flex min-h-0 flex-col", classNames?.base, className)} {...rest}>
        <div className={cn("flex items-center gap-2.5 border-b border-border px-4", classNames?.inputWrapper)}>
          <SearchIcon />
          <input
            role="combobox"
            aria-label={label}
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            autoFocus={autoFocus}
            autoComplete="off"
            spellCheck={false}
            value={query}
            placeholder={placeholder}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "h-12 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted",
              classNames?.input,
            )}
          />
        </div>
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          className={cn(
            "min-h-0 flex-1 overflow-y-auto p-1.5 [scrollbar-color:var(--cennge-border)_transparent] [scrollbar-width:thin]",
            // While searching, separators would split the results into odd pieces.
            query ? "[&_[data-command-separator]]:hidden" : undefined,
            classNames?.list,
          )}
        >
          {children}
        </div>
        {count === 0 ? (
          <div className={cn("px-4 pt-2 pb-6 text-center text-sm text-muted", classNames?.empty)}>{emptyContent}</div>
        ) : null}
        <span aria-live="polite" className="sr-only">
          {query && count !== null ? results(count) : ""}
        </span>
      </div>
    </CommandContext.Provider>
  );
});

/* ----------------------------------------------------------------- parts */

export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: React.ReactNode;
}

/** Items under a heading. Hidden while none of them match. */
export const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(function CommandGroup(
  { heading, className, children, ...rest },
  ref,
) {
  const headingId = useId();
  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={heading ? headingId : undefined}
      className={cn("[&:not(:has([role=option]))]:hidden", className)}
      {...rest}
    >
      {heading ? (
        <div id={headingId} aria-hidden="true" className={groupLabelClass}>
          {heading}
        </div>
      ) : null}
      {children}
    </div>
  );
});

export interface CommandItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Text to search; defaults to the children when they are a string. */
  value?: string;
  /** More words that find this item, e.g. synonyms. */
  keywords?: string[];
  onAction?: () => void;
  isDisabled?: boolean;
  icon?: React.ReactNode;
  /** Shown on the right, e.g. <Kbd keys="command">N</Kbd>. */
  shortcut?: React.ReactNode;
  description?: React.ReactNode;
}

export const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(function CommandItem(
  { value, keywords, onAction, isDisabled = false, icon, shortcut, description, className, children, ...rest },
  ref,
) {
  const { query, activeId, setActiveId, actions } = useCommand("CommandItem");
  const close = React.useContext(CloseContext);
  const id = useId();
  const text = value ?? (typeof children === "string" ? children : "");

  // Enter in the search field runs the active item through this registry.
  const run = React.useRef(() => {});
  run.current = () => {
    if (isDisabled) return;
    onAction?.();
    close?.();
  };
  React.useEffect(() => {
    if (!id) return;
    const registry = actions.current;
    registry.set(id, () => run.current());
    return () => {
      registry.delete(id);
    };
  }, [id, actions]);

  if (!commandMatches(query, text, keywords)) return null;
  const isActive = id !== undefined && id === activeId;

  return (
    <div
      ref={ref}
      id={id}
      role="option"
      aria-selected={isActive}
      aria-disabled={isDisabled || undefined}
      data-active={isActive || undefined}
      data-disabled={isDisabled || undefined}
      onPointerMove={() => {
        if (!isDisabled && id && !isActive) setActiveId(id);
      }}
      // Keep focus in the search field.
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => run.current()}
      className={cn(optionClass, "pr-2.5", className)}
      {...rest}
    >
      {icon ? <span className="flex size-4 shrink-0 items-center justify-center text-muted">{icon}</span> : null}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{children}</span>
        {description ? <span className="truncate text-xs text-muted">{description}</span> : null}
      </span>
      {shortcut ? <span className="ml-auto flex shrink-0 items-center gap-1 text-xs text-muted">{shortcut}</span> : null}
    </div>
  );
});

export const CommandSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CommandSeparator({ className, ...rest }, ref) {
    return <div ref={ref} role="separator" data-command-separator="" className={cn("-mx-1.5 my-1.5 h-px bg-border", className)} {...rest} />;
  },
);

/* ---------------------------------------------------------------- dialog */

export interface CommandDialogProps extends CommandProps {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Keyboard shortcut that opens and closes the palette anywhere on the page; "mod" is ⌘ on a Mac
   * and Ctrl elsewhere. `false` turns it off. @default "mod+k"
   */
  shortcut?: string | false;
  /** Close after an item runs. @default true */
  closeOnAction?: boolean;
}

function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.toLowerCase().split("+");
  const key = parts.pop();
  const wants = (modifier: string) => parts.includes(modifier);
  const mod = event.metaKey || event.ctrlKey;
  return (
    event.key.toLowerCase() === key &&
    (wants("mod") ? mod : !event.metaKey && !event.ctrlKey) &&
    wants("shift") === event.shiftKey &&
    wants("alt") === event.altKey
  );
}

/** A ⌘K command palette: Command in a dialog, opened from anywhere with a shortcut. */
export function CommandDialog({
  isOpen: isOpenProp,
  defaultOpen = false,
  onOpenChange,
  shortcut = "mod+k",
  closeOnAction = true,
  label = "Commands",
  children,
  ...rest
}: CommandDialogProps) {
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
  const isOpen = isOpenProp ?? innerOpen;
  const latest = React.useRef({ isOpen, isOpenProp, onOpenChange });
  latest.current = { isOpen, isOpenProp, onOpenChange };
  const setOpen = React.useCallback((next: boolean) => {
    if (latest.current.isOpenProp === undefined) setInnerOpen(next);
    latest.current.onOpenChange?.(next);
  }, []);

  React.useEffect(() => {
    if (!shortcut) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !matchesShortcut(event, shortcut)) return;
      event.preventDefault();
      setOpen(!latest.current.isOpen);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcut, setOpen]);

  const slots = dialogStyles({ size: "lg", radius: "lg" });
  const contentRef = React.useRef<HTMLDivElement>(null);
  // Opened by a shortcut or someone else's button: no Radix trigger to return focus to.
  const returnFocus = React.useRef<HTMLElement | null>(null);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        {withinBackdrop(
          true,
          <DialogPrimitive.Overlay className={slots.overlay()} />,
          <DialogPrimitive.Content
            ref={contentRef}
            aria-describedby={undefined}
            onOpenAutoFocus={() => {
              returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              returnFocus.current?.focus();
            }}
            onEscapeKeyDown={(event) => {
              // Radix sees Escape before the search field does: with a query typed, Escape clears it instead.
              const field = contentRef.current?.querySelector<HTMLInputElement>('[role="combobox"]');
              if (field?.value) event.preventDefault();
            }}
            // Near the top, so the list grows downwards without moving the search field.
            className={slots.content({ class: "top-[12vh] max-h-[min(32rem,76vh)] translate-y-0 overflow-hidden pb-0" })}
          >
            <DialogPrimitive.Title className="sr-only">{label}</DialogPrimitive.Title>
            <CloseContext.Provider value={closeOnAction ? () => setOpen(false) : null}>
              {/* No autoFocus: Radix focuses the search itself, after noting where focus came from. */}
              <Command label={label} {...rest}>
                {children}
              </Command>
            </CloseContext.Provider>
          </DialogPrimitive.Content>,
        )}
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
