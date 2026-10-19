import { act, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { ScrollArea } from "./scroll-area";

/** jsdom has no layout: give elements with data-radix-scroll-area-viewport a size and a scroll range. */
function mockOverflow({ height = 100, scrollHeight = 100, width = 300, scrollWidth = 300 }) {
  const viewport = (node: HTMLElement) => node.hasAttribute("data-radix-scroll-area-viewport");
  const spies = [
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
      return viewport(this) ? height : 0;
    }),
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(function (this: HTMLElement) {
      return viewport(this) ? scrollHeight : 0;
    }),
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
      return viewport(this) ? width : 0;
    }),
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (this: HTMLElement) {
      return viewport(this) ? scrollWidth : 0;
    }),
  ];
  return () => spies.forEach((spy) => spy.mockRestore());
}

describe("ScrollArea", () => {
  it("content that fits is not a tab stop", () => {
    render(
      <ScrollArea aria-label="Changelog" className="h-40">
        <p>v0.1.0</p>
      </ScrollArea>,
    );
    expect(screen.getByText("v0.1.0")).toBeInTheDocument();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(document.querySelector("[data-radix-scroll-area-viewport]")).not.toHaveAttribute("tabindex");
  });

  it("content that scrolls is a named region the keyboard can reach", () => {
    const restore = mockOverflow({ height: 100, scrollHeight: 500 });
    render(
      <ScrollArea aria-label="Changelog" className="h-40">
        <p>v0.1.0</p>
      </ScrollArea>,
    );
    const region = screen.getByRole("region", { name: "Changelog" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toHaveAttribute("data-radix-scroll-area-viewport");
    restore();
  });

  it("marks the edges that hide more content, and follows scrolling", () => {
    const restore = mockOverflow({ height: 100, scrollHeight: 500 });
    render(
      <ScrollArea fadeEdges className="h-40">
        <p>v0.1.0</p>
      </ScrollArea>,
    );
    const viewport = document.querySelector<HTMLElement>("[data-radix-scroll-area-viewport]")!;
    expect(viewport).toHaveAttribute("data-more-bottom");
    expect(viewport).not.toHaveAttribute("data-more-top");
    act(() => {
      viewport.scrollTop = 400;
      fireEvent.scroll(viewport);
    });
    expect(viewport).toHaveAttribute("data-more-top");
    expect(viewport).not.toHaveAttribute("data-more-bottom");
    expect(viewport.style.getPropertyValue("--fade-size")).toBe("1.5rem");
    restore();
  });

  it("vertical content is a plain block, so long lines can end in an ellipsis; sideways content grows", () => {
    const { rerender } = render(
      <ScrollArea className="h-40">
        <p className="truncate">A very long commit message</p>
      </ScrollArea>,
    );
    const content = () => screen.getByText("A very long commit message").parentElement!;
    expect(content().style.display).toBe("block");
    rerender(
      <ScrollArea orientation="horizontal" className="h-40">
        <p className="truncate">A very long commit message</p>
      </ScrollArea>,
    );
    expect(content().style.display).toBe("table");
  });

  it("hands out the scrolling element", () => {
    const viewportRef = React.createRef<HTMLDivElement>();
    render(
      <ScrollArea viewportRef={viewportRef} className="h-40">
        <p>v0.1.0</p>
      </ScrollArea>,
    );
    expect(viewportRef.current).toHaveAttribute("data-radix-scroll-area-viewport");
  });
});
