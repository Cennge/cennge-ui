import { fireEvent, render, screen, within } from "@testing-library/react";
import {
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarLayout,
  SidebarNav,
  SidebarTrigger,
  useSidebar,
} from "./sidebar";

function RouterLink({ to, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  return <a href={to} data-router-link="" {...rest} />;
}

function CloseOnRouteChange() {
  const { setMobileOpen } = useSidebar();
  return <button onClick={() => setMobileOpen(false)}>Route changed</button>;
}

function Shell({ onCollapsedChange }: { onCollapsedChange?: (collapsed: boolean) => void }) {
  return (
    <SidebarLayout onCollapsedChange={onCollapsedChange}>
      <Sidebar label="Cennge">
        <SidebarHeader>Cennge</SidebarHeader>
        <SidebarNav>
          <SidebarGroup label="Repositories">
            <SidebarItem href="/cennge-ui" isActive icon={<svg aria-hidden="true" />} endContent="12">
              cennge-ui
            </SidebarItem>
            <SidebarItem href="/ai-niche-scout">ai-niche-scout</SidebarItem>
            <SidebarItem asChild>
              <RouterLink to="/dotfiles">dotfiles</RouterLink>
            </SidebarItem>
          </SidebarGroup>
        </SidebarNav>
        <SidebarFooter>
          <SidebarItem>Sign out</SidebarItem>
        </SidebarFooter>
      </Sidebar>
      <main>
        <SidebarTrigger />
        <CloseOnRouteChange />
      </main>
    </SidebarLayout>
  );
}

const column = () => screen.getByRole("complementary", { name: "Cennge" });

describe("Sidebar", () => {
  it("a named column with a navigation landmark; the current page is marked", () => {
    render(<Shell />);
    const nav = within(column()).getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("group", { name: "Repositories" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "cennge-ui 12" })).toHaveAttribute("aria-current", "page");
    expect(within(column()).getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });

  it("asChild renders your own link with the item's styles", () => {
    render(<Shell />);
    const link = within(column()).getByRole("link", { name: "dotfiles" });
    expect(link).toHaveAttribute("data-router-link");
    expect(link).toHaveAttribute("href", "/dotfiles");
    expect(link.className).toContain("rounded-medium");
  });

  it("desktop: the trigger collapses the column to icons; names stay for screen readers", () => {
    const onCollapsedChange = vi.fn();
    render(<Shell onCollapsedChange={onCollapsedChange} />);
    const collapse = screen.getByRole("button", { name: "Collapse sidebar" });
    expect(collapse).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(collapse);
    expect(column()).toHaveAttribute("data-collapsed");
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(within(column()).getByRole("link", { name: "ai-niche-scout" })).toBeInTheDocument();
    expect(within(column()).getByRole("link", { name: "cennge-ui 12" })).toBeInTheDocument(); // the count too
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toHaveAttribute("aria-expanded", "false");
  });

  it("phone: the trigger opens a drawer that closes once an item is chosen", () => {
    render(<Shell />);
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    const drawer = screen.getByRole("dialog", { name: "Cennge" });
    fireEvent.click(within(drawer).getByRole("link", { name: "ai-niche-scout" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("phone: a router that cancels the click to navigate itself still closes the drawer", () => {
    render(
      <SidebarLayout>
        <Sidebar label="Cennge">
          <SidebarItem href="/issues" onClick={(event) => event.preventDefault()}>
            Issues
          </SidebarItem>
          <SidebarItem keepDrawerOpen>Dark theme</SidebarItem>
        </Sidebar>
        <SidebarTrigger />
      </SidebarLayout>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Dark theme" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("link", { name: "Issues" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("phone: a click that opens a new tab keeps the drawer open", () => {
    render(<Shell />);
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    const drawer = screen.getByRole("dialog", { name: "Cennge" });
    fireEvent.click(within(drawer).getByRole("link", { name: "ai-niche-scout" }), { ctrlKey: true });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("useSidebar closes the drawer from elsewhere, e.g. on a route change", () => {
    render(<Shell />);
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    // Behind a modal drawer the page is aria-hidden.
    expect(screen.getByRole("button", { name: "Open navigation", hidden: true })).toHaveAttribute("aria-expanded", "true");
    // The page behind a modal drawer is inert to the pointer; a router would call this directly.
    fireEvent.click(screen.getByRole("button", { name: "Route changed", hidden: true }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
