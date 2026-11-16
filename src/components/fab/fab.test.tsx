import { render, screen } from "@testing-library/react";
import { BottomBar } from "../bottom-bar";
import { FloatingActionButton } from "./fab";

describe("FloatingActionButton", () => {
  it("is named by its label; extended, the label shows instead", () => {
    const { rerender } = render(<FloatingActionButton icon={<svg />} label="Log a meal" />);
    const button = screen.getByRole("button", { name: "Log a meal" });
    expect(button).toHaveAttribute("aria-label", "Log a meal");
    expect(button).toHaveAttribute("type", "button");
    rerender(<FloatingActionButton icon={<svg />} label="Log a meal" isExtended />);
    expect(screen.getByRole("button", { name: "Log a meal" })).not.toHaveAttribute("aria-label");
    expect(screen.getByText("Log a meal")).toBeVisible();
  });

  it("fixed, it sits above whatever the bottom stack holds; static, it stays in the flow", () => {
    const { rerender } = render(<FloatingActionButton icon={<svg />} label="Log" />);
    expect(screen.getByRole("button").style.bottom).toContain("var(--cennge-bottom-bar, 0px)");
    rerender(<FloatingActionButton icon={<svg />} label="Log" position="static" />);
    expect(screen.getByRole("button").style.bottom).toBe("");
  });

  it("takes a link through asChild, and stays disabled as one", () => {
    render(
      <FloatingActionButton icon={<svg />} label="New workout" asChild isDisabled>
        <a href="/workout/new" />
      </FloatingActionButton>,
    );
    expect(screen.getByRole("link", { name: "New workout" })).toHaveAttribute("aria-disabled", "true");
  });
});

describe("BottomBar", () => {
  it("fixed, it stands on the navigation and writes its own height", () => {
    const { container, unmount } = render(<BottomBar>Log set</BottomBar>);
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.style.bottom).toBe("var(--cennge-bottom-nav, 0px)");
    expect(bar.style.paddingBottom).toContain("--cennge-bottom-safe");
    expect(document.documentElement.style.getPropertyValue("--cennge-bottom-bar")).toMatch(/px$/);
    unmount();
    expect(document.documentElement.style.getPropertyValue("--cennge-bottom-bar")).toBe("");
  });
});
