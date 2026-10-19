import * as React from "react";
import { Dialog as DialogPrimitive, Slot } from "radix-ui";
import { cn } from "../../utils/cn";
import { useId } from "../../utils/use-id";
import { DrawerContent } from "../drawer/drawer";
import { Tooltip } from "../tooltip";

/* ----------------------------------------------------------------- state */

interface SidebarContextValue {
  isCollapsed: boolean;
  setCollapsed: (isCollapsed: boolean) => void;
  isMobileOpen: boolean;
  setMobileOpen: (isOpen: boolean) => void;
  /** Inside the phone drawer rather than the desktop column. */
  isInDrawer: boolean;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

/** The sidebar's state, e.g. to close the phone drawer when the route changes some other way. */
export function useSidebar(): Omit<SidebarContextValue, "isInDrawer"> {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used inside <SidebarLayout>.");
  return context;
}

export interface SidebarLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Desktop: the sidebar shows icons only. Persist it (e.g. in a cookie) through onCollapsedChange. */
  isCollapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (isCollapsed: boolean) => void;
}

/** Page shell: a Sidebar next to the main content. Below the md breakpoint the sidebar becomes a drawer. */
export const SidebarLayout = React.forwardRef<HTMLDivElement, SidebarLayoutProps>(function SidebarLayout(
  { isCollapsed: collapsedProp, defaultCollapsed = false, onCollapsedChange, className, children, ...rest },
  ref,
) {
  const [innerCollapsed, setInnerCollapsed] = React.useState(defaultCollapsed);
  const isCollapsed = collapsedProp ?? innerCollapsed;
  const [isMobileOpen, setMobileOpen] = React.useState(false);
  const setCollapsed = (next: boolean) => {
    if (collapsedProp === undefined) setInnerCollapsed(next);
    onCollapsedChange?.(next);
  };
  return (
    <SidebarContext.Provider value={{ isCollapsed, setCollapsed, isMobileOpen, setMobileOpen, isInDrawer: false }}>
      <div ref={ref} className={cn("flex min-h-dvh w-full", className)} {...rest}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
});

/* --------------------------------------------------------------- sidebar */

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Names the sidebar and the phone drawer for screen readers. @default "Sidebar" */
  label?: string;
}

/**
 * A sticky column on desktop; on phones the same content opens in a drawer from the left, which
 * closes once an item is chosen.
 */
export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { label = "Sidebar", className, children, ...rest },
  ref,
) {
  const context = useSidebarContext("Sidebar");
  return (
    <>
      <aside
        ref={ref}
        aria-label={label}
        data-collapsed={context.isCollapsed || undefined}
        className={cn(
          "group/sidebar sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface-1 md:flex",
          "transition-[width] duration-(--cennge-duration) ease-tactile motion-reduce:transition-none",
          "data-[collapsed]:w-16",
          className,
        )}
        {...rest}
      >
        {children}
      </aside>
      <DialogPrimitive.Root open={context.isMobileOpen} onOpenChange={context.setMobileOpen}>
        <DrawerContent placement="left" size="sm" aria-describedby={undefined} className="max-w-[min(20rem,85vw)] pb-0">
          <DialogPrimitive.Title className="sr-only">{label}</DialogPrimitive.Title>
          <SidebarContext.Provider value={{ ...context, isCollapsed: false, isInDrawer: true }}>
            <div className="group/sidebar flex h-full min-h-0 flex-col">{children}</div>
          </SidebarContext.Provider>
        </DrawerContent>
      </DialogPrimitive.Root>
    </>
  );
});

function useSidebarContext(part: string): SidebarContextValue {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error(`<${part}> must be used inside <SidebarLayout>.`);
  return context;
}

export const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function SidebarHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("flex h-14 shrink-0 items-center gap-2 px-3", className)} {...rest} />;
  },
);

export interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  /** @default "Main" */
  label?: string;
}

/** The scrolling navigation area. */
export const SidebarNav = React.forwardRef<HTMLElement, SidebarNavProps>(function SidebarNav(
  { label = "Main", className, ...rest },
  ref,
) {
  return (
    <nav
      ref={ref}
      aria-label={label}
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-2 py-2",
        "[scrollbar-color:var(--cennge-border)_transparent] [scrollbar-width:thin]",
        className,
      )}
      {...rest}
    />
  );
});

export const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function SidebarFooter({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("shrink-0 border-t border-border p-2", className)} {...rest} />;
  },
);

export interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
}

export const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(function SidebarGroup(
  { label, className, children, ...rest },
  ref,
) {
  const { isCollapsed } = useSidebarContext("SidebarGroup");
  const labelId = useId();
  return (
    <div ref={ref} role="group" aria-labelledby={label ? labelId : undefined} className={cn("flex flex-col gap-0.5", className)} {...rest}>
      {label ? (
        <div id={labelId} className={cn("px-2.5 pt-1 pb-1 text-xs font-semibold text-muted", isCollapsed && "sr-only")}>
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
});

/* ------------------------------------------------------------------ item */

export interface SidebarItemProps extends React.AnchorHTMLAttributes<HTMLElement> {
  /** The current page: highlighted and announced as such. */
  isActive?: boolean;
  icon?: React.ReactNode;
  /** Shown at the end, e.g. a count. Collapsed, only screen readers get it. */
  endContent?: React.ReactNode;
  /** Render your own link, e.g. Next.js <Link>, with the item's styles and behaviour. */
  asChild?: boolean;
  /** On phones, keep the drawer open after a click, e.g. for a theme switch. */
  keepDrawerOpen?: boolean;
}

const isNewTabClick = (event: React.MouseEvent) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button === 1;

/**
 * A navigation link (`href`) or, without one, a button. On phones a click also closes the drawer,
 * unless it opens a new tab. Client-side routers (Next.js Link) cancel the click to navigate
 * themselves; the drawer closes all the same.
 */
export const SidebarItem = React.forwardRef<HTMLElement, SidebarItemProps>(function SidebarItem(
  { isActive = false, icon, endContent, asChild = false, keepDrawerOpen = false, href, className, children, onClick, ...rest },
  ref,
) {
  const { isCollapsed, isInDrawer, setMobileOpen } = useSidebarContext("SidebarItem");
  const Comp: React.ElementType = asChild ? Slot.Root : href ? "a" : "button";
  // With asChild the label is the child link's own content; the item's layout goes inside that link.
  const link = asChild ? (React.Children.only(children) as React.ReactElement<{ children?: React.ReactNode }>) : null;
  const label = link ? link.props.children : children;
  const content = (
    <>
      {icon ? <span className="flex size-4 shrink-0 items-center justify-center">{icon}</span> : null}
      <span className={cn("min-w-0 flex-1 truncate", isCollapsed && "sr-only")}>{label}</span>
      {endContent ? (
        <>
          {/* Keeps the name "cennge-ui 12" rather than "cennge-ui12"; flex layout does not draw it. */}{" "}
          {/* Collapsed to icons there is no room, but screen readers still hear the count. */}
          <span className={cn("shrink-0 text-xs text-muted", isCollapsed && "sr-only")}>{endContent}</span>
        </>
      ) : null}
    </>
  );
  const item = (
    <Comp
      ref={ref}
      // Only when set: an undefined href would reach a custom link through asChild and replace its own.
      {...(href !== undefined ? { href } : {})}
      {...(!asChild && href === undefined ? { type: "button" } : {})}
      aria-current={isActive ? "page" : undefined}
      data-active={isActive || undefined}
      onClick={(event: React.MouseEvent<HTMLElement>) => {
        onClick?.(event);
        if (isInDrawer && !keepDrawerOpen && !isNewTabClick(event)) setMobileOpen(false);
      }}
      className={cn(
        "flex h-9 w-full shrink-0 cursor-pointer items-center gap-2.5 rounded-medium px-2.5 text-left text-sm font-medium text-muted",
        "transition-colors duration-(--cennge-duration-fast) hover:bg-default-bg hover:text-foreground",
        "outline-none focus-visible:outline-2 focus-visible:outline-ring",
        "data-[active]:bg-primary-bg data-[active]:text-primary-text",
        isCollapsed && "justify-center px-0",
        className,
      )}
      {...rest}
    >
      {link ? React.cloneElement(link, undefined, content) : content}
    </Comp>
  );
  // Collapsed to icons: the label shows on hover and focus; screen readers read it either way.
  return isCollapsed ? (
    <Tooltip content={label} placement="right">
      {item}
    </Tooltip>
  ) : (
    item
  );
});

/* --------------------------------------------------------------- trigger */

export interface SidebarTriggerProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** @default { open: "Open navigation", collapse: "Collapse sidebar", expand: "Expand sidebar" } */
  labels?: Partial<{ open: string; collapse: string; expand: string }>;
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function PanelIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
      <path d="M9.5 4.5v15" />
    </svg>
  );
}

const triggerClass = cn(
  "size-9 shrink-0 cursor-pointer items-center justify-center rounded-medium text-muted",
  "transition-[background-color,color,transform] duration-(--cennge-duration-fast) hover:bg-default-bg hover:text-foreground active:scale-95",
  "outline-none focus-visible:outline-2 focus-visible:outline-ring",
);

/**
 * Opens the drawer on phones and collapses the column on desktop. Two buttons switched by CSS, so
 * each carries the right name and state from the first render, server rendering included.
 */
export function SidebarTrigger({ labels, className, ...rest }: SidebarTriggerProps) {
  const { isCollapsed, setCollapsed, isMobileOpen, setMobileOpen } = useSidebarContext("SidebarTrigger");
  const text = { open: "Open navigation", collapse: "Collapse sidebar", expand: "Expand sidebar", ...labels };
  return (
    <>
      <button
        type="button"
        aria-label={text.open}
        aria-haspopup="dialog"
        aria-expanded={isMobileOpen}
        onClick={() => setMobileOpen(true)}
        className={cn(triggerClass, "flex md:hidden", className)}
        {...rest}
      >
        <MenuIcon />
      </button>
      <button
        type="button"
        aria-label={isCollapsed ? text.expand : text.collapse}
        aria-expanded={!isCollapsed}
        onClick={() => setCollapsed(!isCollapsed)}
        className={cn(triggerClass, "hidden md:flex", className)}
        {...rest}
      >
        <PanelIcon />
      </button>
    </>
  );
}
