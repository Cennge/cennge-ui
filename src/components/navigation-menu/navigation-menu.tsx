import * as React from "react";
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui";
import { tv } from "../../utils/tv";
import { cn } from "../../utils/cn";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const navigationMenu = tv({
  slots: {
    root: "relative z-10 flex max-w-max",
    list: "flex list-none items-center gap-1",
    trigger: [
      "group inline-flex h-9 items-center gap-1 rounded-medium px-3 text-sm font-medium text-foreground select-none",
      "transition-colors duration-(--cennge-duration-fast) motion-reduce:transition-none",
      "hover:bg-default-bg data-[state=open]:bg-default-bg",
      "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
      "disabled:pointer-events-none disabled:opacity-(--cennge-disabled-opacity)",
    ],
    chevron: "size-3.5 text-muted transition-transform duration-(--cennge-duration) motion-reduce:transition-none group-data-[state=open]:rotate-180",
    topLink: [
      "inline-flex h-9 items-center rounded-medium px-3 text-sm font-medium text-foreground",
      "transition-colors duration-(--cennge-duration-fast) motion-reduce:transition-none hover:bg-default-bg",
      "aria-[current=page]:text-primary-text",
      "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
    ],
    // Radix sizes the panel from the content, so the content must not size itself from the panel: absolute
    // and as wide as what is in it. As a block it took the panel's width minus the border, and the panel
    // shrank by 2px a frame to nothing.
    content: [
      "absolute top-0 left-0 w-max max-w-[calc(100vw-1rem)] p-2",
      "data-[motion^=from-]:animate-cennge-fade-in data-[motion^=to-]:animate-cennge-fade-out motion-reduce:animate-none",
    ],
    viewportPosition: "absolute top-full left-0 pt-2",
    viewport: [
      // box-content: the border goes outside the measured size of the content.
      "relative box-content h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) max-w-[calc(100vw-1rem)] overflow-hidden",
      "rounded-large border border-border bg-surface-3 shadow-floating",
      "data-[state=open]:animate-cennge-pop-in data-[state=closed]:animate-cennge-pop-out motion-reduce:animate-none",
    ],
    link: [
      "flex flex-col gap-0.5 rounded-medium px-3 py-2 text-sm text-foreground",
      "transition-colors duration-(--cennge-duration-fast) motion-reduce:transition-none hover:bg-default-bg",
      "aria-[current=page]:bg-primary-bg",
      "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:outline-ring",
    ],
    linkTitle: "font-medium",
    linkDescription: "text-xs leading-5 text-muted",
  },
  variants: {
    orientation: {
      horizontal: {},
      vertical: { root: "flex-col", list: "flex-col items-stretch", viewportPosition: "top-0 left-full pt-0 pl-2" },
    },
  },
});

type Orientation = "horizontal" | "vertical";

interface NavigationMenuContextValue {
  openOn: "hover" | "click";
  slots: ReturnType<typeof navigationMenu>;
  keepMounted: boolean;
}

const NavigationMenuContext = React.createContext<NavigationMenuContextValue | null>(null);
const InContentContext = React.createContext(false);

function useNavigationMenuContext(part: string) {
  const context = React.useContext(NavigationMenuContext);
  if (!context) throw new Error(`${part} must be used inside <NavigationMenu>`);
  return context;
}

/** For openOn="click": Radix skips its hover handlers when the event is already prevented. */
const ignorePointer = (event: React.PointerEvent) => event.preventDefault();

export interface NavigationMenuProps
  extends Omit<React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>, "asChild" | "dir"> {
  /** Names the navigation landmark, e.g. "Main". */
  "aria-label"?: string;
  /** Open a panel when the pointer rests on its trigger, or only on click (and Enter/Space). @default "hover" */
  openOn?: "hover" | "click";
  /** @default "horizontal" */
  orientation?: Orientation;
  /** Keep closed panels in the page (hidden), so their links are in the HTML for search engines. */
  keepMounted?: boolean;
  classNames?: Partial<Record<"viewport", string>>;
}

/**
 * Site navigation with dropdown panels. The panel opens under its own trigger, kept on screen, and can
 * open on click instead of hover. One shared panel moves between triggers, so switching is quick.
 */
export const NavigationMenu = React.forwardRef<HTMLElement, NavigationMenuProps>(function NavigationMenu(
  { openOn = "hover", orientation = "horizontal", keepMounted = false, className, classNames, children, value, onValueChange, defaultValue, ...rest },
  forwardedRef,
) {
  const slots = navigationMenu({ orientation });
  const rootRef = React.useRef<HTMLElement | null>(null);
  React.useImperativeHandle(forwardedRef, () => rootRef.current as HTMLElement);
  // State, not a ref: Radix mounts the panel a render after the value changes, and placing must wait for it.
  const [panel, setPanel] = React.useState<HTMLDivElement | null>(null);
  const [inner, setInner] = React.useState(defaultValue ?? "");
  const active = value ?? inner;
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

  // Place the shared panel under (or beside) the open trigger, but inside the window.
  const place = React.useCallback(() => {
    const root = rootRef.current;
    const trigger = root?.querySelector<HTMLElement>('[data-nav-trigger][data-state="open"]');
    if (!root || !panel || !trigger) return;
    const rootBox = root.getBoundingClientRect();
    const triggerBox = trigger.getBoundingClientRect();
    const margin = 8;
    // The layout viewport: window.innerWidth grows on a phone once anything overflows (the page zooms out).
    const { clientWidth: screenWidth, clientHeight: screenHeight } = document.documentElement;
    const within = (wanted: number, lowest: number, highest: number) => Math.max(Math.min(wanted, highest), lowest);
    if (orientation === "vertical") {
      // Beside the trigger, level with it; on a narrow screen it moves left over the list rather than off screen.
      const start = rootBox.right + 8; // the panel sits after the list, past an 8px gap
      setOffset({
        x: within(0, margin - start, screenWidth - margin - start - panel.offsetWidth),
        y: within(triggerBox.top - rootBox.top, margin - rootBox.top, screenHeight - rootBox.top - panel.offsetHeight - margin),
      });
      return;
    }
    const wanted = triggerBox.left + triggerBox.width / 2 - rootBox.left - panel.offsetWidth / 2;
    setOffset({ x: within(wanted, margin - rootBox.left, screenWidth - rootBox.left - panel.offsetWidth - margin), y: 0 });
  }, [orientation, panel]);

  useIsomorphicLayoutEffect(() => {
    if (active) place();
  }, [active, place]);

  React.useEffect(() => {
    if (!active || !panel || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(place);
    observer.observe(panel);
    window.addEventListener("resize", place);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [active, panel, place]);

  const context = React.useMemo(() => ({ openOn, slots, keepMounted }), [openOn, slots, keepMounted]);

  return (
    <NavigationMenuContext.Provider value={context}>
      <NavigationMenuPrimitive.Root
        ref={rootRef}
        orientation={orientation}
        value={active}
        onValueChange={(next) => {
          if (value === undefined) setInner(next);
          onValueChange?.(next);
        }}
        className={slots.root({ class: className })}
        {...rest}
      >
        {children}
        <div
          className={slots.viewportPosition()}
          style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
        >
          {/* Radix renders every panel's content here, so links learn they are in a panel from this provider. */}
          <InContentContext.Provider value>
            <NavigationMenuPrimitive.Viewport
              ref={setPanel}
              forceMount={keepMounted || undefined}
              className={cn(slots.viewport(), keepMounted && "data-[state=closed]:hidden", classNames?.viewport)}
              onPointerLeave={openOn === "click" ? ignorePointer : undefined}
            />
          </InContentContext.Provider>
        </div>
      </NavigationMenuPrimitive.Root>
    </NavigationMenuContext.Provider>
  );
});

export const NavigationMenuList = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(function NavigationMenuList({ className, ...rest }, ref) {
  const { slots } = useNavigationMenuContext("NavigationMenuList");
  return <NavigationMenuPrimitive.List ref={ref} className={slots.list({ class: className })} {...rest} />;
});

export const NavigationMenuItem = NavigationMenuPrimitive.Item;

export const NavigationMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(function NavigationMenuTrigger(
  { className, children, onPointerMove, onPointerLeave, onPointerDown, onClick, ...rest },
  ref,
) {
  const { slots, openOn } = useNavigationMenuContext("NavigationMenuTrigger");
  const pointerType = React.useRef("");
  return (
    <NavigationMenuPrimitive.Trigger
      ref={ref}
      data-nav-trigger=""
      className={slots.trigger({ class: className })}
      onPointerMove={openOn === "click" ? ignorePointer : onPointerMove}
      onPointerLeave={openOn === "click" ? ignorePointer : onPointerLeave}
      onPointerDown={(event) => {
        pointerType.current = event.pointerType;
        onPointerDown?.(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        // With hover opening, the mouse owns the panel: a click on an open trigger keeps it open instead of
        // toggling it shut (it was opened by resting on it a moment ago). Leaving, Escape or a click
        // elsewhere close it. Touch and keyboard (detail 0) toggle as usual.
        const isOpen = event.currentTarget.getAttribute("data-state") === "open";
        if (openOn === "hover" && isOpen && event.detail > 0 && pointerType.current === "mouse") event.preventDefault();
      }}
      {...rest}
    >
      {children}
      <svg viewBox="0 0 24 24" className={slots.chevron()} fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </NavigationMenuPrimitive.Trigger>
  );
});

export const NavigationMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(function NavigationMenuContent({ className, onPointerLeave, ...rest }, ref) {
  const { slots, openOn, keepMounted } = useNavigationMenuContext("NavigationMenuContent");
  return (
    <NavigationMenuPrimitive.Content
      ref={ref}
      forceMount={keepMounted || undefined}
      // keepMounted: closed panels stay in the page for search engines and Ctrl+F, just not shown.
      className={slots.content({ class: [keepMounted && "data-[state=closed]:hidden", className] })}
      onPointerLeave={openOn === "click" ? ignorePointer : onPointerLeave}
      {...rest}
    />
  );
});

export interface NavigationMenuLinkProps
  extends Omit<React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Link>, "active" | "title"> {
  /** The current page: read as such (aria-current="page") and highlighted. */
  isActive?: boolean;
  /** In a panel: a bold first line; `description` goes under it. */
  title?: React.ReactNode;
  description?: React.ReactNode;
}

/**
 * A link in a panel, or in the bar inside its own NavigationMenuItem. With asChild it styles your router's
 * link (Next.js Link).
 */
export const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(function NavigationMenuLink(
  { isActive = false, title, description, className, children, asChild, ...rest },
  ref,
) {
  const { slots } = useNavigationMenuContext("NavigationMenuLink");
  const inContent = React.useContext(InContentContext);
  const rich = title !== undefined || description !== undefined;
  const body = rich ? (
    <>
      {title !== undefined ? <span className={slots.linkTitle()}>{title}</span> : null}
      {description !== undefined ? <span className={slots.linkDescription()}>{description}</span> : null}
      {children}
    </>
  ) : (
    children
  );
  const link = (
    <NavigationMenuPrimitive.Link
      ref={ref}
      active={isActive}
      aria-current={isActive ? "page" : undefined}
      asChild={asChild}
      className={inContent ? slots.link({ class: className }) : slots.topLink({ class: className })}
      {...rest}
    >
      {asChild && rich && React.isValidElement<{ children?: React.ReactNode }>(children)
        ? React.cloneElement(children, undefined, (
            <>
              {title !== undefined ? <span className={slots.linkTitle()}>{title}</span> : null}
              {description !== undefined ? <span className={slots.linkDescription()}>{description}</span> : null}
            </>
          ))
        : body}
    </NavigationMenuPrimitive.Link>
  );
  return link;
});
