import * as React from "react";
import { tv } from "../../utils/tv";
import { useCenngeDefaults } from "../../provider";
import type { CenngeColor, CenngeSize } from "../../types";
import { Spinner } from "../spinner";

export interface TreeItem {
  /** Unique within the tree. */
  id: string;
  label: React.ReactNode;
  /** Plain text for type-ahead when `label` is not a string. */
  textValue?: string;
  /** Replaces the default folder or file icon. */
  icon?: React.ReactNode;
  children?: TreeItem[];
  /** Has children that `loadChildren` will fetch on first expand. */
  hasChildren?: boolean;
  isDisabled?: boolean;
}

/* Literal strings per colour, so Tailwind can find them. */
const selectedColors: Record<CenngeColor, string> = {
  default: "data-[selected]:bg-default-bg",
  primary: "data-[selected]:bg-primary-bg data-[selected]:text-primary-text",
  secondary: "data-[selected]:bg-secondary-bg data-[selected]:text-secondary-text",
  success: "data-[selected]:bg-success-bg data-[selected]:text-success-text",
  warning: "data-[selected]:bg-warning-bg data-[selected]:text-warning-text",
  danger: "data-[selected]:bg-danger-bg data-[selected]:text-danger-text",
  info: "data-[selected]:bg-info-bg data-[selected]:text-info-text",
};

const tree = tv({
  slots: {
    base: "flex flex-col gap-px outline-none select-none",
    item: [
      "relative flex cursor-pointer items-center gap-1.5 rounded-medium pr-2 text-foreground",
      "transition-colors duration-(--cennge-duration-fast) hover:bg-default-bg",
      "outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
      "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:hover:bg-transparent",
    ],
    chevron: [
      "flex size-4 shrink-0 items-center justify-center text-muted",
      "transition-transform duration-(--cennge-duration-fast) ease-tactile motion-reduce:transition-none",
      "data-[expanded]:rotate-90",
    ],
    icon: "flex size-4 shrink-0 items-center justify-center text-muted [[data-selected]>&]:text-current",
    label: "min-w-0 truncate",
  },
  variants: {
    size: {
      sm: { item: "h-7 text-xs" },
      md: { item: "h-8 text-sm" },
      lg: { item: "h-10 text-sm" },
    },
    color: {
      default: { item: selectedColors.default },
      primary: { item: selectedColors.primary },
      secondary: { item: selectedColors.secondary },
      success: { item: selectedColors.success },
      warning: { item: selectedColors.warning },
      danger: { item: selectedColors.danger },
      info: { item: selectedColors.info },
    },
  },
  defaultVariants: { size: "md", color: "primary" },
});

type TreeSlots = "base" | "item" | "chevron" | "icon" | "label";

export interface TreeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  items: TreeItem[];
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  onExpandedChange?: (keys: string[]) => void;
  selectedKey?: string | null;
  defaultSelectedKey?: string | null;
  onSelectionChange?: (key: string | null) => void;
  /** `"none"` for a tree you only browse. @default "single" */
  selectionMode?: "single" | "none";
  /** A file (an item without children) was opened: click or Enter. */
  onAction?: (item: TreeItem) => void;
  /** Fetches the children of an item with `hasChildren` on its first expand. */
  loadChildren?: (item: TreeItem) => Promise<TreeItem[]>;
  /** Called when `loadChildren` fails; the item collapses so it can be tried again. */
  onLoadError?: (item: TreeItem, error: unknown) => void;
  /** Hide the default folder and file icons. */
  hideIcons?: boolean;
  /** Indent per level. @default "1rem" */
  indent?: string;
  /** Colour of the selected item. @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  classNames?: Partial<Record<TreeSlots, string>>;
}

interface VisibleItem {
  item: TreeItem;
  level: number;
  position: number;
  setSize: number;
  parentId: string | null;
  isExpandable: boolean;
  isExpanded: boolean;
}

const textOf = (item: TreeItem) => item.textValue ?? (typeof item.label === "string" ? item.label : "");

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FolderIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {isOpen ? (
        <path d="M3 7.5V18a1.5 1.5 0 0 0 1.5 1.5h13.2a1.5 1.5 0 0 0 1.4-1l2.4-6.6a1 1 0 0 0-.9-1.4H7.4a1.5 1.5 0 0 0-1.4 1L3 19M3 7.5V6a1.5 1.5 0 0 1 1.5-1.5h4l2 2.5h6A1.5 1.5 0 0 1 18 8.5V10" strokeLinejoin="round" />
      ) : (
        <path d="M3 6a1.5 1.5 0 0 1 1.5-1.5h4l2 2.5h9A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5V6Z" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L13.5 3Z M13.5 3v5.5H19" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * A tree of items, e.g. a repository's files. Follows the WAI-ARIA tree pattern: one Tab stop,
 * arrows to move, open and close, Home/End, type-ahead, `*` to open all siblings, Enter to open.
 */
export const Tree = React.forwardRef<HTMLDivElement, TreeProps>(function Tree(props, ref) {
  const defaults = useCenngeDefaults();
  const {
    items,
    expandedKeys: expandedProp,
    defaultExpandedKeys,
    onExpandedChange,
    selectedKey: selectedProp,
    defaultSelectedKey = null,
    onSelectionChange,
    selectionMode = "single",
    onAction,
    loadChildren,
    onLoadError,
    hideIcons = false,
    indent = "1rem",
    color = defaults.color && defaults.color !== "default" ? defaults.color : "primary",
    size = defaults.size ?? "md",
    className,
    classNames,
    ...rest
  } = props;

  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [innerExpanded, setInnerExpanded] = React.useState<string[]>(defaultExpandedKeys ?? []);
  const expanded = new Set(expandedProp ?? innerExpanded);
  // A load that fails later collapses its item against the expanded set of that moment.
  const latestExpanded = React.useRef(expanded);
  latestExpanded.current = expanded;
  const setExpanded = (next: Set<string>) => {
    const keys = [...next];
    if (expandedProp === undefined) setInnerExpanded(keys);
    onExpandedChange?.(keys);
  };

  const [innerSelected, setInnerSelected] = React.useState<string | null>(defaultSelectedKey);
  const selectedKey = selectedProp !== undefined ? selectedProp : innerSelected;
  const select = (key: string) => {
    if (selectionMode === "none" || key === selectedKey) return;
    if (selectedProp === undefined) setInnerSelected(key);
    onSelectionChange?.(key);
  };

  // Children fetched by loadChildren, and the items still loading.
  const [loaded, setLoaded] = React.useState<Record<string, TreeItem[]>>({});
  const [loading, setLoading] = React.useState<Set<string>>(() => new Set());
  const mounted = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const childrenOf = (item: TreeItem) => item.children ?? loaded[item.id];

  // The rows on screen, in order: what the arrow keys walk through.
  const visible: VisibleItem[] = [];
  const walk = (list: TreeItem[], level: number, parentId: string | null) => {
    list.forEach((item, index) => {
      const children = childrenOf(item);
      const isExpandable = Boolean(children?.length || item.hasChildren);
      const isExpanded = isExpandable && expanded.has(item.id);
      visible.push({ item, level, position: index + 1, setSize: list.length, parentId, isExpandable, isExpanded });
      if (isExpanded && children) walk(children, level + 1, item.id);
    });
  };
  walk(items, 1, null);

  const [focusedKey, setFocusedKey] = React.useState<string | null>(null);
  const focusTarget =
    visible.find((entry) => entry.item.id === focusedKey) ??
    visible.find((entry) => entry.item.id === selectedKey) ??
    visible[0];

  const focusAfterRender = React.useRef<string | null>(null);
  React.useEffect(() => {
    const key = focusAfterRender.current;
    if (key === null) return;
    focusAfterRender.current = null;
    const items = rootRef.current?.querySelectorAll<HTMLElement>("[data-key]") ?? [];
    Array.from(items).find((element) => element.dataset.key === key)?.focus();
  });
  const moveFocus = (key: string | undefined) => {
    if (key === undefined) return;
    setFocusedKey(key);
    focusAfterRender.current = key;
  };

  const isAncestor = (ancestorId: string, key: string | null): boolean => {
    let entry = visible.find((candidate) => candidate.item.id === key);
    while (entry?.parentId) {
      if (entry.parentId === ancestorId) return true;
      const parentId: string = entry.parentId;
      entry = visible.find((candidate) => candidate.item.id === parentId);
    }
    return false;
  };

  // Opens several items in one update (`*` opens all siblings), fetching children where needed.
  const expand = (...entries: VisibleItem[]) => {
    const opening = entries.filter((entry) => !entry.item.isDisabled && entry.isExpandable && !entry.isExpanded);
    if (opening.length === 0) return;
    const next = new Set(expanded);
    for (const entry of opening) next.add(entry.item.id);
    setExpanded(next);
    for (const entry of opening) load(entry.item);
  };

  const load = (item: TreeItem) => {
    if (childrenOf(item) || !loadChildren || loading.has(item.id)) return;
    setLoading((current) => new Set(current).add(item.id));
    loadChildren(item).then(
      (children) => {
        if (!mounted.current) return;
        setLoaded((current) => ({ ...current, [item.id]: children }));
        setLoading((current) => {
          const next = new Set(current);
          next.delete(item.id);
          return next;
        });
      },
      (error: unknown) => {
        if (!mounted.current) return;
        setLoading((current) => {
          const next = new Set(current);
          next.delete(item.id);
          return next;
        });
        // Collapsed again, so the next expand tries again.
        const next = new Set(latestExpanded.current);
        next.delete(item.id);
        setExpanded(next);
        onLoadError?.(item, error);
      },
    );
  };

  const collapse = (entry: VisibleItem) => {
    if (entry.item.isDisabled || !entry.isExpanded) return;
    const next = new Set(expanded);
    next.delete(entry.item.id);
    setExpanded(next);
    // Focus inside the closing branch would vanish with it.
    const focusedInside = (document.activeElement as HTMLElement | null)?.dataset?.key;
    if (focusedInside && isAncestor(entry.item.id, focusedInside)) moveFocus(entry.item.id);
  };

  const activate = (entry: VisibleItem) => {
    if (entry.item.isDisabled) return;
    select(entry.item.id);
    if (entry.isExpandable) {
      if (entry.isExpanded) collapse(entry);
      else expand(entry);
    } else {
      onAction?.(entry.item);
    }
  };

  // Type-ahead: letters typed in quick succession jump to the next item that starts with them.
  const typeahead = React.useRef({ text: "", timer: undefined as ReturnType<typeof setTimeout> | undefined });
  React.useEffect(() => () => clearTimeout(typeahead.current.timer), []);
  const searchFrom = (index: number, char: string) => {
    const state = typeahead.current;
    clearTimeout(state.timer);
    state.text += char.toLocaleLowerCase();
    state.timer = setTimeout(() => {
      state.text = "";
    }, 500);
    const ordered = [...visible.slice(index + (state.text.length === 1 ? 1 : 0)), ...visible.slice(0, index + 1)];
    const match = ordered.find((entry) => textOf(entry.item).toLocaleLowerCase().startsWith(state.text));
    if (match) moveFocus(match.item.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, entry: VisibleItem, index: number) => {
    const parent = visible.find((candidate) => candidate.item.id === entry.parentId);
    switch (event.key) {
      case "ArrowDown":
        moveFocus(visible[index + 1]?.item.id);
        break;
      case "ArrowUp":
        moveFocus(visible[index - 1]?.item.id);
        break;
      case "ArrowRight":
        if (entry.isExpandable && !entry.isExpanded) expand(entry);
        else if (entry.isExpanded) moveFocus(visible[index + 1]?.parentId === entry.item.id ? visible[index + 1]?.item.id : undefined);
        break;
      case "ArrowLeft":
        if (entry.isExpanded) collapse(entry);
        else if (parent) moveFocus(parent.item.id);
        break;
      case "Home":
        moveFocus(visible[0]?.item.id);
        break;
      case "End":
        moveFocus(visible[visible.length - 1]?.item.id);
        break;
      case "Enter":
      case " ":
        activate(entry);
        break;
      case "*":
        expand(...visible.filter((candidate) => candidate.parentId === entry.parentId));
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          searchFrom(index, event.key);
          break;
        }
        return;
    }
    event.preventDefault();
  };

  const slots = tree({ size, color });

  return (
    <div
      ref={rootRef}
      role="tree"
      aria-multiselectable={selectionMode === "single" ? false : undefined}
      className={slots.base({ class: [classNames?.base, className] })}
      {...rest}
    >
      {visible.map((entry, index) => {
        const { item, level, isExpandable, isExpanded } = entry;
        const isLoading = loading.has(item.id);
        const isSelected = selectionMode === "single" && item.id === selectedKey;
        return (
          <div
            key={item.id}
            role="treeitem"
            data-key={item.id}
            aria-level={level}
            aria-posinset={entry.position}
            aria-setsize={entry.setSize}
            aria-expanded={isExpandable ? isExpanded : undefined}
            aria-selected={selectionMode === "single" ? isSelected : undefined}
            aria-disabled={item.isDisabled || undefined}
            aria-busy={isLoading || undefined}
            tabIndex={item.id === focusTarget?.item.id ? 0 : -1}
            data-selected={isSelected || undefined}
            data-disabled={item.isDisabled || undefined}
            style={{ paddingInlineStart: `calc(${level - 1} * ${indent} + 0.375rem)` }}
            className={slots.item({ class: classNames?.item })}
            onFocus={() => setFocusedKey(item.id)}
            onClick={(event) => {
              // A click on the arrow only opens or closes.
              if ((event.target as HTMLElement).closest("[data-chevron]")) {
                if (isExpanded) collapse(entry);
                else expand(entry);
                return;
              }
              activate(entry);
            }}
            onKeyDown={(event) => handleKeyDown(event, entry, index)}
          >
            <span data-chevron="" data-expanded={isExpanded || undefined} className={slots.chevron({ class: classNames?.chevron })}>
              {isLoading ? <Spinner size="sm" /> : isExpandable ? <ChevronIcon /> : null}
            </span>
            {hideIcons && !item.icon ? null : (
              <span className={slots.icon({ class: classNames?.icon })}>
                {item.icon ?? (isExpandable ? <FolderIcon isOpen={isExpanded} /> : <FileIcon />)}
              </span>
            )}
            <span className={slots.label({ class: classNames?.label })}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
});
