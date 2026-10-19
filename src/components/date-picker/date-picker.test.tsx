import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DatePicker } from "./date-picker";

const field = () => screen.getByRole("textbox", { name: "Release" });
const typeAndLeave = (text: string) => {
  fireEvent.change(field(), { target: { value: text } });
  fireEvent.blur(field());
};

describe("DatePicker", () => {
  it("shows the value the way the locale writes it, with the pattern as placeholder", () => {
    const { rerender } = render(<DatePicker label="Release" value="2026-10-19" locale="ru-RU" />);
    expect(field()).toHaveValue("19.10.2026");
    rerender(<DatePicker label="Release" value="2026-10-19" locale="en-US" />);
    expect(field()).toHaveValue("10/19/2026");
    rerender(<DatePicker label="Release" value={null} locale="en-US" />);
    expect(field()).toHaveAttribute("placeholder", "MM/DD/YYYY");
  });

  it("reads a typed date when the field loses focus and tidies the text", () => {
    const onValueChange = vi.fn();
    render(<DatePicker label="Release" locale="ru-RU" onValueChange={onValueChange} />);
    typeAndLeave("19102026");
    expect(onValueChange).toHaveBeenCalledWith("2026-10-19");
    expect(field()).toHaveValue("19.10.2026");
  });

  it("keeps text that is not a date and says why under the field", () => {
    const onValueChange = vi.fn();
    render(<DatePicker label="Release" locale="ru-RU" description="Planned day" onValueChange={onValueChange} />);
    typeAndLeave("31.02.2026");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(field()).toHaveValue("31.02.2026");
    expect(field()).toBeInvalid();
    expect(field()).toHaveAccessibleDescription("Enter a date as DD.MM.YYYY");
    fireEvent.change(field(), { target: { value: "28.02.2026" } });
    expect(field()).not.toBeInvalid();
    expect(field()).toHaveAccessibleDescription("Planned day");
  });

  it("refuses dates outside the limits or unavailable ones, with the reason", () => {
    render(
      <DatePicker
        label="Release"
        locale="ru-RU"
        minValue="2026-10-01"
        maxValue="2026-12-31"
        isDateUnavailable={(date) => date === "2026-10-24"}
      />,
    );
    typeAndLeave("01.01.2027");
    expect(field()).toHaveAccessibleDescription("Choose a date from 01.10.2026 to 31.12.2026");
    typeAndLeave("24.10.2026");
    expect(field()).toHaveAccessibleDescription("This date is not available");
  });

  it("translates the reasons", () => {
    render(
      <DatePicker
        label="Release"
        locale="ru-RU"
        formatError={(error) => (error.type === "invalid" ? `Введите дату в формате ${error.pattern.replace("DD", "ДД").replace("MM", "ММ").replace("YYYY", "ГГГГ")}` : "Дата недоступна")}
      />,
    );
    typeAndLeave("сегодня");
    expect(field()).toHaveAccessibleDescription("Введите дату в формате ДД.ММ.ГГГГ");
  });

  it("an emptied field clears the value", () => {
    const onValueChange = vi.fn();
    render(<DatePicker label="Release" defaultValue="2026-10-19" locale="ru-RU" onValueChange={onValueChange} />);
    typeAndLeave("");
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("Escape undoes typing that was not saved yet", () => {
    render(<DatePicker label="Release" defaultValue="2026-10-19" locale="ru-RU" />);
    fireEvent.change(field(), { target: { value: "01.0" } });
    fireEvent.keyDown(field(), { key: "Escape" });
    expect(field()).toHaveValue("19.10.2026");
  });

  it("the calendar button opens the calendar on the selected day; a click picks and closes it", () => {
    const onValueChange = vi.fn();
    render(<DatePicker label="Release" defaultValue="2026-10-19" locale="en-US" onValueChange={onValueChange} />);
    const button = screen.getByRole("button", { name: "Choose date" });
    fireEvent.click(button);
    const popup = screen.getByRole("dialog", { name: "Choose date" });
    expect(screen.getByRole("button", { name: "Monday, October 19, 2026" })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Friday, October 23, 2026" }));
    expect(onValueChange).toHaveBeenCalledWith("2026-10-23");
    expect(popup).not.toBeInTheDocument();
    expect(field()).toHaveValue("10/23/2026");
  });

  it("Escape in the year grid goes back to the days and keeps the calendar open", () => {
    render(<DatePicker label="Release" defaultValue="2026-10-19" locale="en-US" />);
    fireEvent.click(screen.getByRole("button", { name: "Choose date" }));
    fireEvent.click(screen.getByRole("button", { name: "Year: 2026" }));
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
    expect(screen.queryByRole("grid", { name: "Year" })).toBeNull();
    expect(screen.getByRole("dialog", { name: "Choose date" })).toBeInTheDocument();
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Choose date" })).toBeNull();
  });

  it("Alt+ArrowDown in the field opens the calendar", () => {
    render(<DatePicker label="Release" locale="en-US" />);
    fireEvent.keyDown(field(), { key: "ArrowDown", altKey: true });
    expect(screen.getByRole("dialog", { name: "Choose date" })).toBeInTheDocument();
  });

  it("submits the ISO date under its name, already on Enter", () => {
    function Form() {
      const [submitted, setSubmitted] = useState("");
      return (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(String(new FormData(event.currentTarget).get("release")));
          }}
        >
          <DatePicker label="Release" name="release" locale="ru-RU" />
          <output>{submitted}</output>
        </form>
      );
    }
    render(<Form />);
    fireEvent.change(field(), { target: { value: "19.10.2026" } });
    fireEvent.keyDown(field(), { key: "Enter" });
    expect(document.querySelector<HTMLInputElement>('input[type="hidden"][name="release"]')?.value).toBe("2026-10-19");
  });

  it("follows a controlled value", () => {
    function Controlled() {
      const [value, setValue] = useState<string | null>("2026-10-19");
      return (
        <>
          <button onClick={() => setValue("2027-01-05")}>Next sprint</button>
          <DatePicker label="Release" value={value} onValueChange={setValue} locale="ru-RU" />
        </>
      );
    }
    render(<Controlled />);
    fireEvent.click(screen.getByRole("button", { name: "Next sprint" }));
    expect(field()).toHaveValue("05.01.2027");
  });

  it("read-only and disabled fields cannot open the calendar", () => {
    const { rerender } = render(<DatePicker label="Release" value="2026-10-19" isReadOnly />);
    expect(screen.getByRole("button", { name: "Choose date" })).toBeDisabled();
    rerender(<DatePicker label="Release" value="2026-10-19" isDisabled />);
    expect(field()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Choose date" })).toBeDisabled();
  });
});
