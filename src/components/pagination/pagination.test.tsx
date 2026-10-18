import { fireEvent, render, screen } from "@testing-library/react";
import { Pagination, getPageItems } from "./pagination";

describe("getPageItems", () => {
  it("lists every page when they fit", () => {
    expect(getPageItems(5, 3)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageItems(7, 1)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("puts ellipses on the correct sides", () => {
    expect(getPageItems(20, 1)).toEqual([1, 2, 3, 4, 5, "end-ellipsis", 20]);
    expect(getPageItems(20, 10)).toEqual([1, "start-ellipsis", 9, 10, 11, "end-ellipsis", 20]);
    expect(getPageItems(20, 20)).toEqual([1, "start-ellipsis", 16, 17, 18, 19, 20]);
  });

  it("keeps a constant number of slots so the control does not jump", () => {
    for (let page = 1; page <= 30; page++) expect(getPageItems(30, page)).toHaveLength(7);
  });
});

describe("Pagination", () => {
  it("marks the current page and moves with the arrows", () => {
    const onPageChange = vi.fn();
    render(<Pagination total={10} defaultPage={1} onPageChange={onPageChange} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
  });
});
