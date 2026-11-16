import { renderToString } from "react-dom/server";
import { render, screen } from "@testing-library/react";
import { BottomNavigation, BottomNavigationItem } from "./bottom-navigation";

describe("BottomNavigation", () => {
  it("is a named navigation of buttons or links; the active one is the current page", () => {
    render(
      <BottomNavigation aria-label="Main">
        <BottomNavigationItem icon={<svg />} label="Today" isActive />
        <BottomNavigationItem icon={<svg />} label="Log" asChild>
          <a href="/log" />
        </BottomNavigationItem>
      </BottomNavigation>,
    );
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(screen.getByRole("button", { name: "Today" })).toHaveAttribute("aria-current", "page");
    const link = screen.getByRole("link", { name: "Log" });
    expect(link).toHaveAttribute("href", "/log");
    expect(link).not.toHaveAttribute("aria-current");
    expect(nav.querySelectorAll("li")).toHaveLength(2);
  });

  it("a count is read after the label, 99+ past 99; a dot as new", () => {
    render(
      <BottomNavigation aria-label="Main">
        <BottomNavigationItem icon={<svg />} label="Inbox" badge={120} />
        <BottomNavigationItem icon={<svg />} label="Profile" badge />
      </BottomNavigation>,
    );
    expect(screen.getByRole("button", { name: /^Inbox ?99\+$/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Profile ?new$/ })).toBeInTheDocument();
  });

  it("fixed, it writes its height on <html> while mounted and takes the safe area from what sits on it", () => {
    const { unmount } = render(<BottomNavigation aria-label="Main" />);
    const root = document.documentElement.style;
    expect(root.getPropertyValue("--cennge-bottom-nav")).toMatch(/px$/);
    expect(root.getPropertyValue("--cennge-bottom-safe")).toBe("0px");
    unmount();
    expect(root.getPropertyValue("--cennge-bottom-nav")).toBe("");
    expect(root.getPropertyValue("--cennge-bottom-safe")).toBe("");
  });

  it("static, it writes nothing; it renders on the server", () => {
    render(<BottomNavigation aria-label="Main" position="static" />);
    expect(document.documentElement.style.getPropertyValue("--cennge-bottom-nav")).toBe("");
    expect(renderToString(<BottomNavigation aria-label="Main" />)).toContain('aria-label="Main"');
  });
});
