import { useState, type ReactElement } from "react";
import { renderToString } from "react-dom/server";
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

  it("the year and month grids jump anywhere, e.g. to a birth year", () => {
    render(<Calendar defaultValue="2026-10-19" locale="en-US" />);
    fireEvent.click(screen.getByRole("button", { name: "Year: 2026" }));
    const years = screen.getByRole("grid", { name: "Year" });
    expect(within(years).getByRole("button", { name: "2026" })).toHaveFocus();
    fireEvent.click(within(years).getByRole("button", { name: "1990" }));
    expect(screen.queryByRole("grid", { name: "Year" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Month: October" }));
    fireEvent.click(within(screen.getByRole("grid", { name: "Month" })).getByRole("button", { name: "March" }));
    expect(grid()).toHaveAccessibleName("March 1990");
    expect(day("Monday, March 19, 1990")).toHaveAttribute("tabindex", "0");
  });

  it("year grid keyboard: arrows move, Enter picks and returns to the days; Escape goes back unchanged", () => {
    render(<Calendar defaultValue="2026-10-19" locale="en-US" />);
    const yearButton = screen.getByRole("button", { name: "Year: 2026" });
    fireEvent.click(yearButton);
    expect(yearButton).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(focusedDay(), { key: "ArrowDown" }); // a row of four
    expect(focusedDay()).toHaveTextContent("2030");
    fireEvent.keyDown(focusedDay(), { key: "ArrowLeft" });
    expect(focusedDay()).toHaveTextContent("2029");
    fireEvent.click(focusedDay()); // Enter on a button is a click
    expect(grid()).toHaveAccessibleName("October 2029");
    expect(focusedDay()).toHaveAccessibleName("Friday, October 19, 2029");

    const monthButton = screen.getByRole("button", { name: "Month: October" });
    fireEvent.click(monthButton);
    fireEvent.keyDown(focusedDay(), { key: "Escape" });
    expect(screen.queryByRole("grid", { name: "Month" })).toBeNull();
    expect(monthButton).toHaveFocus();
    expect(grid()).toHaveAccessibleName("October 2029");
  });

  it("months outside the limits cannot be picked; years stop at them", () => {
    render(<Calendar defaultValue="2026-10-19" minValue="2026-03-15" maxValue="2027-06-01" locale="en-US" />);
    fireEvent.click(screen.getByRole("button", { name: "Month: October" }));
    const months = screen.getByRole("grid", { name: "Month" });
    expect(within(months).getByRole("button", { name: "February" })).toBeDisabled();
    expect(within(months).getByRole("button", { name: "March" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Year: 2026" }));
    const years = within(screen.getByRole("grid", { name: "Year" })).getAllByRole("button");
    expect(years.map((button) => button.textContent)).toEqual(["2026", "2027"]);
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
    expect(screen.getByRole("button", { name: `Год: ${now.getFullYear()}` })).toBeInTheDocument();
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

  describe("rendered on a server", () => {
    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    // The server renders on October 31 and the browser hydrates on November 1: another time zone, or a
    // static page built the day before. Whatever React finds amiss it reports on the console or as an error.
    function hydrateNextDay(ui: ReactElement) {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date(2026, 9, 31, 23, 0));
      const html = renderToString(ui);
      vi.setSystemTime(new Date(2026, 10, 1, 9, 0));
      const container = document.body.appendChild(document.createElement("div"));
      container.innerHTML = html;
      const problems = vi.spyOn(console, "error");
      const uncaught = vi.fn();
      window.addEventListener("error", uncaught);
      render(ui, { container, hydrate: true });
      window.removeEventListener("error", uncaught);
      expect(problems).not.toHaveBeenCalled();
      expect(uncaught).not.toHaveBeenCalled();
      return html;
    }

    it("without a value: hydrates cleanly, then shows the browser's month with its today", () => {
      const html = hydrateNextDay(<Calendar locale="en-US" />);
      expect(html).not.toContain("aria-current");
      expect(grid()).toHaveAccessibleName("November 2026");
      const today = day("Sunday, November 1, 2026");
      expect(today).toHaveAttribute("aria-current", "date");
      expect(today).toHaveAttribute("tabindex", "0");
    });

    it("with a value: its month comes from the server, today is marked once hydrated", () => {
      const html = hydrateNextDay(<Calendar value="2026-10-19" locale="en-US" />);
      expect(html).toContain("October 2026");
      expect(html).not.toContain("aria-current");
      expect(grid()).toHaveAccessibleName("October 2026");
      expect(day("Sunday, November 1, 2026")).toHaveAttribute("aria-current", "date");
      expect(day("Monday, October 19, 2026")).toHaveAttribute("tabindex", "0");
    });
  });
});
