import { act, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { VirtualList } from "./virtual-list";
import type { Virtualizer } from "./use-virtualizer";

const commits = Array.from({ length: 10_000 }, (_, i) => ({ sha: `c${i}`, message: `Commit ${i + 1}` }));

/** jsdom has no layout: give the scrolling element a height and a scroll range. */
function mockViewport(height: number) {
  const isViewport = (node: HTMLElement) => node.hasAttribute("data-radix-scroll-area-viewport");
  const spies = [
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
      return isViewport(this) ? height : 0;
    }),
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(function (this: HTMLElement) {
      return isViewport(this) ? 400_000 : 0;
    }),
  ];
  // requestAnimationFrame runs the scroll update at once.
  const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callback(0);
    return 0;
  });
  return () => {
    spies.forEach((spy) => spy.mockRestore());
    raf.mockRestore();
  };
}

describe("VirtualList", () => {
  it("renders only the rows in view, and tells the full size", () => {
    const restore = mockViewport(400);
    render(
      <VirtualList items={commits} getKey={(commit) => commit.sha} aria-label="Commits" className="h-96">
        {(commit) => <span>{commit.message}</span>}
      </VirtualList>,
    );
    const rows = screen.getAllByRole("listitem");
    // 400px of 40px rows plus overscan below: far fewer than 10,000.
    expect(rows.length).toBeGreaterThan(9);
    expect(rows.length).toBeLessThan(20);
    expect(rows[0]).toHaveAttribute("aria-setsize", "10000");
    expect(rows[0]).toHaveAttribute("aria-posinset", "1");
    expect(screen.getByRole("list")).toHaveStyle({ height: "400000px" });
    expect(screen.getByRole("region", { name: "Commits" })).toBeInTheDocument();
    restore();
  });

  it("scrolling renders the rows at the new position", () => {
    const restore = mockViewport(400);
    render(
      <VirtualList items={commits} aria-label="Commits">
        {(commit) => <span>{commit.message}</span>}
      </VirtualList>,
    );
    const viewport = screen.getByRole("region", { name: "Commits" });
    act(() => {
      viewport.scrollTop = 200_000; // row 5,001 at the top
      fireEvent.scroll(viewport);
    });
    expect(screen.getByText("Commit 5001")).toBeInTheDocument();
    expect(screen.queryByText("Commit 1")).not.toBeInTheDocument();
    const row = screen.getByText("Commit 5001").parentElement!;
    expect(row).toHaveAttribute("aria-posinset", "5001");
    expect(row.style.transform).toBe("translateY(200000px)");
    restore();
  });

  it("scrollToIndex brings a row into view", () => {
    const restore = mockViewport(400);
    const listRef = React.createRef<Pick<Virtualizer, "scrollToIndex">>();
    render(
      <VirtualList items={commits} aria-label="Commits" listRef={listRef}>
        {(commit) => <span>{commit.message}</span>}
      </VirtualList>,
    );
    const viewport = screen.getByRole("region", { name: "Commits" });
    act(() => listRef.current?.scrollToIndex(9_999));
    expect(viewport.scrollTop).toBe(400_000 - 400); // the last row ends at the bottom edge
    act(() => listRef.current?.scrollToIndex(100, { align: "start" }));
    expect(viewport.scrollTop).toBe(4_000);
    restore();
  });

  it("an empty list renders nothing", () => {
    render(
      <VirtualList items={[]} aria-label="Commits">
        {() => <span>never</span>}
      </VirtualList>,
    );
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
