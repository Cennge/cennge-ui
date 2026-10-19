import { fireEvent, render, screen } from "@testing-library/react";
import { DateRangePicker } from "./date-range-picker";

const start = () => screen.getByRole("textbox", { name: "Start date" });
const end = () => screen.getByRole("textbox", { name: "End date" });
const typeAndLeave = (field: HTMLElement, text: string) => {
  fireEvent.change(field, { target: { value: text } });
  fireEvent.blur(field);
};

describe("DateRangePicker", () => {
  it("is a labelled pair of fields showing the range in the locale's format", () => {
    render(<DateRangePicker label="Vacation" defaultValue={{ start: "2026-10-26", end: "2026-11-04" }} locale="ru-RU" />);
    expect(screen.getByRole("group", { name: "Vacation" })).toBeInTheDocument();
    expect(start()).toHaveValue("26.10.2026");
    expect(end()).toHaveValue("04.11.2026");
  });

  it("saves once both ends are typed and in order", () => {
    const onValueChange = vi.fn();
    render(<DateRangePicker label="Vacation" locale="ru-RU" onValueChange={onValueChange} />);
    typeAndLeave(start(), "26102026");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(start()).not.toBeInvalid();
    typeAndLeave(end(), "4.11.26");
    expect(onValueChange).toHaveBeenCalledWith({ start: "2026-10-26", end: "2026-11-04" });
    expect(end()).toHaveValue("04.11.2026");
  });

  it("explains why typed dates are refused", () => {
    render(
      <DateRangePicker label="Vacation" locale="ru-RU" isDateUnavailable={(date) => date === "2026-10-28"} />,
    );
    typeAndLeave(start(), "30.10.2026");
    typeAndLeave(end(), "27.10.2026");
    expect(start()).toHaveAccessibleDescription("The end date is before the start date");
    typeAndLeave(start(), "26.10.2026"); // 26–27: fine
    expect(start()).not.toBeInvalid();
    typeAndLeave(end(), "29.10.2026"); // 26–29 runs across the 28th
    expect(end()).toHaveAccessibleDescription("This date is not available");
    typeAndLeave(end(), "31.13.2026");
    expect(end()).toHaveAccessibleDescription("Enter a date as DD.MM.YYYY");
    expect(end()).toBeInvalid();
  });

  it("emptying both fields clears the range", () => {
    const onValueChange = vi.fn();
    render(
      <DateRangePicker
        label="Vacation"
        locale="ru-RU"
        defaultValue={{ start: "2026-10-26", end: "2026-11-04" }}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.change(start(), { target: { value: "" } });
    typeAndLeave(end(), "");
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("picks a range in the calendar: two months, two clicks, then it closes", () => {
    const onValueChange = vi.fn();
    render(<DateRangePicker label="Vacation" locale="en-US" defaultValue={{ start: "2026-10-26", end: "2026-10-30" }} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Choose dates" }));
    const popup = screen.getByRole("dialog", { name: "Choose dates" });
    expect(screen.getAllByRole("grid")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Monday, November 2, 2026" }));
    fireEvent.click(screen.getByRole("button", { name: "Friday, November 6, 2026" }));
    expect(onValueChange).toHaveBeenCalledWith({ start: "2026-11-02", end: "2026-11-06" });
    expect(popup).not.toBeInTheDocument();
    expect(start()).toHaveValue("11/02/2026");
  });

  it("the first Escape drops a half-chosen range, the second closes the calendar", () => {
    render(<DateRangePicker label="Vacation" locale="en-US" defaultValue={{ start: "2026-10-26", end: "2026-10-30" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Choose dates" }));
    const first = screen.getByRole("button", { name: "Monday, November 2, 2026" });
    fireEvent.click(first);
    fireEvent.keyDown(first, { key: "Escape" });
    expect(screen.getByRole("dialog", { name: "Choose dates" })).toBeInTheDocument();
    fireEvent.keyDown(first, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Choose dates" })).toBeNull();
  });

  it("submits both ISO dates under their names", () => {
    render(
      <DateRangePicker
        label="Vacation"
        startName="from"
        endName="to"
        defaultValue={{ start: "2026-10-26", end: "2026-11-04" }}
      />,
    );
    expect(document.querySelector('input[name="from"]')).toHaveValue("2026-10-26");
    expect(document.querySelector('input[name="to"]')).toHaveValue("2026-11-04");
  });
});
