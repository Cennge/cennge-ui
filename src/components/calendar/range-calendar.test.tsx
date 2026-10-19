import { fireEvent, render, screen } from "@testing-library/react";
import { RangeCalendar } from "./range-calendar";

const day = (label: string) => screen.getByRole("button", { name: label });
const cell = (label: string) => day(label).closest("td") as HTMLElement;
const announced = () =>
  Array.from(document.querySelectorAll('[aria-live="polite"]'))
    .map((node) => node.textContent)
    .join(" | ");

describe("RangeCalendar", () => {
  it("picks a range with two clicks, in either order", () => {
    const onValueChange = vi.fn();
    render(<RangeCalendar defaultFocusedValue="2026-10-01" locale="en-US" onValueChange={onValueChange} />);
    fireEvent.click(day("Friday, October 23, 2026"));
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.click(day("Monday, October 19, 2026"));
    expect(onValueChange).toHaveBeenCalledWith({ start: "2026-10-19", end: "2026-10-23" });
    expect(cell("Monday, October 19, 2026")).toHaveAttribute("data-range-start");
    expect(cell("Wednesday, October 21, 2026")).toHaveAttribute("data-range-middle");
    expect(cell("Wednesday, October 21, 2026")).toHaveAttribute("aria-selected", "true");
    expect(cell("Friday, October 23, 2026")).toHaveAttribute("data-range-end");
    expect(announced()).toMatch(/October 19\s–\s23, 2026/); // ICU puts thin spaces around the dash
  });

  it("previews the range up to the pointer while the end is being chosen", () => {
    render(<RangeCalendar defaultFocusedValue="2026-10-01" locale="en-US" />);
    fireEvent.click(day("Monday, October 19, 2026"));
    fireEvent.pointerEnter(day("Thursday, October 22, 2026"));
    expect(cell("Tuesday, October 20, 2026")).toHaveAttribute("data-range-middle");
    expect(cell("Thursday, October 22, 2026")).toHaveAttribute("data-range-end");
  });

  it("keyboard: the range follows focus after the first Enter; Escape starts over", () => {
    const onValueChange = vi.fn();
    render(<RangeCalendar defaultFocusedValue="2026-10-19" locale="en-US" autoFocus onValueChange={onValueChange} />);
    fireEvent.click(document.activeElement as HTMLElement); // Enter on a day is a click
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "ArrowRight" });
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "ArrowRight" });
    expect(cell("Tuesday, October 20, 2026")).toHaveAttribute("data-range-middle");
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
    expect(cell("Tuesday, October 20, 2026")).not.toHaveAttribute("data-range-middle");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("a range cannot run across an unavailable day", () => {
    const onValueChange = vi.fn();
    render(
      <RangeCalendar
        defaultFocusedValue="2026-10-01"
        locale="en-US"
        isDateUnavailable={(date) => date === "2026-10-21"}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(day("Monday, October 19, 2026"));
    fireEvent.click(day("Friday, October 23, 2026"));
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.click(day("Tuesday, October 20, 2026"));
    expect(onValueChange).toHaveBeenCalledWith({ start: "2026-10-19", end: "2026-10-20" });
  });

  it("the same day twice is a one-day range", () => {
    const onValueChange = vi.fn();
    render(<RangeCalendar defaultFocusedValue="2026-10-01" locale="en-US" onValueChange={onValueChange} />);
    fireEvent.click(day("Monday, October 19, 2026"));
    fireEvent.click(day("Monday, October 19, 2026"));
    expect(onValueChange).toHaveBeenCalledWith({ start: "2026-10-19", end: "2026-10-19" });
    expect(cell("Monday, October 19, 2026")).not.toHaveAttribute("data-range-start");
  });

  it("shows two months side by side without the neighbouring days", () => {
    render(<RangeCalendar defaultValue={{ start: "2026-10-28", end: "2026-11-03" }} locale="en-US" visibleMonths={2} />);
    expect(screen.getAllByRole("grid").map((grid) => grid.getAttribute("aria-label"))).toEqual([
      "October 2026",
      "November 2026",
    ]);
    expect(document.querySelector("[data-outside]")).toBeNull();
    expect(cell("Sunday, November 1, 2026")).toHaveAttribute("data-range-middle");
  });
});
