import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Calendar } from "./calendar";

const grid = () => screen.getByRole("grid");
const day = (label: string) => screen.getByRole("button", { name: label });
const focusedDay = () => document.activeElement as HTMLElement;
const press = (key: string, options: { shiftKey?: boolean } = {}) => fireEvent.keyDown(focusedDay(), { key, ...options });

describe("Calendar", () => {
  it("shows the selected month with a single Tab stop on the selected day", () => {
    render(<Calendar value="2026-10-19" locale="en-US" />);
    expect(grid()).toHaveAccessibleName("October 2026");
    const selected = day("Monday, October 19, 2026");
    expect(selected).toHaveAttribute("tabindex", "0");
    expect(selected.closest("td")).toHaveAttribute("aria-selected", "true");
    expect(within(grid()).getAllByRole("button").filter((b) => b.tabIndex === 0)).toHaveLength(1);
  });

  it("starts weeks on the locale's first day and names days in its language", () => {
    const { unmount } = render(<Calendar value="2026-10-19" locale="en-US" />);
    expect(screen.getAllByRole("columnheader")[0]).toHaveTextContent("Sun");
    unmount();
    render(<Calendar value="2026-10-19" locale="ru-RU" />);
    expect(screen.getAllByRole("columnheader")[0]).toHaveTextContent("Пн");
    expect(grid()).toHaveAccessibleName("Октябрь 2026 г.");
    expect(day("понедельник, 19 октября 2026 г.")).toBeInTheDocument();
  });

  it("a click selects and reports an ISO date", () => {
    const onValueChange = vi.fn();
    render(<Calendar defaultValue="2026-10-19" locale="en-US" onValueChange={onValueChange} />);
    fireEvent.click(day("Thursday, October 22, 2026"));
    expect(onValueChange).toHaveBeenCalledWith("2026-10-22");
    expect(day("Thursday, October 22, 2026").closest("td")).toHaveAttribute("aria-selected", "true");
  });

  it("keyboard: arrows by day and week, Home/End to the week's ends, Page keys by month and year", () => {
    render(<Calendar defaultValue="2026-10-19" locale="en-US" autoFocus />);
    expect(focusedDay()).toHaveAccessibleName("Monday, October 19, 2026");
    press("ArrowRight");
    expect(focusedDay()).toHaveAccessibleName("Tuesday, October 20, 2026");
    press("ArrowDown");
    expect(focusedDay()).toHaveAccessibleName("Tuesday, October 27, 2026");
    press("Home");
    expect(focusedDay()).toHaveAccessibleName("Sunday, October 25, 2026");
    press("End");
    expect(focusedDay()).toHaveAccessibleName("Saturday, October 31, 2026");
    press("ArrowRight");
    expect(focusedDay()).toHaveAccessibleName("Sunday, November 1, 2026");
    expect(grid()).toHaveAccessibleName("November 2026");
    press("PageDown");
    expect(focusedDay()).toHaveAccessibleName("Tuesday, December 1, 2026");
    press("PageUp", { shiftKey: true });
    expect(focusedDay()).toHaveAccessibleName("Monday, December 1, 2025");
  });

  it("keeps keyboard focus inside minValue and maxValue and disables days outside", () => {
    render(<Calendar defaultValue="2026-10-19" minValue="2026-10-10" maxValue="2026-10-25" locale="en-US" autoFocus />);
    expect(day("Friday, October 9, 2026")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous month" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
    press("PageDown");
    expect(focusedDay()).toHaveAccessibleName("Sunday, October 25, 2026");
    press("ArrowDown");
    expect(focusedDay()).toHaveAccessibleName("Sunday, October 25, 2026");
  });

  it("unavailable days stay focusable but cannot be chosen", () => {
    const onValueChange = vi.fn();
    render(
      <Calendar
        defaultValue="2026-10-19"
        locale="en-US"
        isDateUnavailable={(date) => date === "2026-10-20"}
        onValueChange={onValueChange}
      />,
    );
    const booked = day("Tuesday, October 20, 2026");
    expect(booked).toHaveAttribute("aria-disabled", "true");
    expect(booked).toBeEnabled();
    fireEvent.click(booked);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("month and year pickers jump anywhere, e.g. to a birth year", () => {
    render(<Calendar defaultValue="2026-10-19" locale="en-US" />);
    fireEvent.change(screen.getByRole("combobox", { name: "Year" }), { target: { value: "1990" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Month" }), { target: { value: "3" } });
    expect(grid()).toHaveAccessibleName("March 1990");
    expect(day("Monday, March 19, 1990")).toHaveAttribute("tabindex", "0");
  });

  it("previous and next buttons move by a month", () => {
    render(<Calendar defaultValue="2026-01-31" locale="en-US" />);
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(grid()).toHaveAccessibleName("February 2026");
    expect(day("Saturday, February 28, 2026")).toHaveAttribute("tabindex", "0");
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(grid()).toHaveAccessibleName("December 2025");
  });

  it("a day of the neighbouring month selects it and shows that month", () => {
    render(<Calendar defaultValue="2026-10-19" locale="en-US" />);
    const outside = day("Monday, November 2, 2026");
    expect(outside).toHaveAttribute("data-outside");
    fireEvent.click(outside);
    expect(grid()).toHaveAccessibleName("November 2026");
  });

  it("follows a controlled value set from outside", () => {
    function Controlled() {
      const [value, setValue] = useState("2026-10-19");
      return (
        <>
          <button onClick={() => setValue("2027-03-08")}>Set</button>
          <Calendar value={value} onValueChange={setValue} locale="en-US" />
        </>
      );
    }
    render(<Controlled />);
    fireEvent.click(screen.getByRole("button", { name: "Set" }));
    expect(grid()).toHaveAccessibleName("March 2027");
    expect(day("Monday, March 8, 2027").closest("td")).toHaveAttribute("aria-selected", "true");
  });

  it("marks today and translates its controls", () => {
    const now = new Date();
    render(<Calendar labels={{ previousMonth: "Предыдущий месяц", nextMonth: "Следующий месяц", month: "Месяц", year: "Год" }} />);
    expect(screen.getByRole("button", { name: "Предыдущий месяц" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Год" })).toHaveValue(String(now.getFullYear()));
    const todayButton = document.querySelector('[aria-current="date"]');
    expect(todayButton).toHaveTextContent(String(now.getDate()));
  });

  it("read-only can be browsed but not changed; disabled cannot be used at all", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Calendar defaultValue="2026-10-19" locale="en-US" isReadOnly onValueChange={onValueChange} />);
    fireEvent.click(day("Tuesday, October 20, 2026"));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Next month" })).toBeEnabled();
    rerender(<Calendar defaultValue="2026-10-19" locale="en-US" isDisabled onValueChange={onValueChange} />);
    expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
    expect(day("Tuesday, October 20, 2026")).toBeDisabled();
  });
});
