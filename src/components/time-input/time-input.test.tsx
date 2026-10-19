import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { TimeInput } from "./time-input";

const field = () => screen.getByRole("textbox", { name: "Start" });
const typeAndLeave = (text: string) => {
  fireEvent.change(field(), { target: { value: text } });
  fireEvent.blur(field());
};
const caretAt = (position: number) => (field() as HTMLInputElement).setSelectionRange(position, position);
const press = (key: string) => fireEvent.keyDown(field(), { key });

describe("TimeInput", () => {
  it("shows the time on the locale's clock", () => {
    const { rerender } = render(<TimeInput label="Start" value="14:30" locale="ru-RU" />);
    expect(field()).toHaveValue("14:30");
    rerender(<TimeInput label="Start" value="14:30" locale="en-US" />);
    expect((field() as HTMLInputElement).value).toMatch(/^2:30\sPM$/);
    rerender(<TimeInput label="Start" value="14:30" locale="en-US" hourCycle={24} />);
    expect(field()).toHaveValue("14:30");
  });

  it("reads typed times when the field loses focus", () => {
    const onValueChange = vi.fn();
    render(<TimeInput label="Start" locale="en-US" onValueChange={onValueChange} />);
    typeAndLeave("930p");
    expect(onValueChange).toHaveBeenLastCalledWith("21:30");
    typeAndLeave("0815");
    expect(onValueChange).toHaveBeenLastCalledWith("08:15");
    expect((field() as HTMLInputElement).value).toMatch(/^8:15\sAM$/);
  });

  it("keeps text that is not a time and explains", () => {
    render(<TimeInput label="Start" locale="ru-RU" minValue="09:00" maxValue="18:00" />);
    typeAndLeave("25:00");
    expect(field()).toHaveValue("25:00");
    expect(field()).toHaveAccessibleDescription("Enter a time as HH:MM");
    typeAndLeave("20:00");
    expect(field()).toHaveAccessibleDescription("Choose a time from 09:00 to 18:00");
    fireEvent.keyDown(field(), { key: "Escape" });
    expect(field()).toHaveValue("");
  });

  it("arrow keys change the part under the caret; minutes move by step", () => {
    const onValueChange = vi.fn();
    render(<TimeInput label="Start" defaultValue="14:07" locale="ru-RU" step={15} onValueChange={onValueChange} />);
    field().focus();
    caretAt(4); // in the minutes
    press("ArrowUp");
    expect(field()).toHaveValue("14:15");
    press("ArrowUp");
    expect(field()).toHaveValue("14:30");
    caretAt(1); // in the hours
    press("ArrowDown");
    expect(field()).toHaveValue("13:30");
    expect(onValueChange).toHaveBeenLastCalledWith("13:30");
    expect(document.querySelector('[aria-live="polite"]')).toHaveTextContent("13:30");
  });

  it("arrows in AM/PM switch half of the day, and stop at the limits", () => {
    render(<TimeInput label="Start" defaultValue="09:00" locale="en-US" maxValue="22:00" />);
    field().focus();
    caretAt((field() as HTMLInputElement).value.length); // in "AM"
    press("ArrowUp");
    expect((field() as HTMLInputElement).value).toMatch(/^9:00\sPM$/);
    caretAt(0);
    press("ArrowUp");
    expect((field() as HTMLInputElement).value).toMatch(/^10:00\sPM$/);
    press("ArrowUp");
    expect((field() as HTMLInputElement).value).toMatch(/^10:00\sPM$/); // capped at maxValue
  });

  it("submits HH:mm under its name, already on Enter", () => {
    function Form() {
      const [value, setValue] = useState<string | null>(null);
      return <TimeInput label="Start" name="start" locale="ru-RU" value={value} onValueChange={setValue} />;
    }
    render(<Form />);
    fireEvent.change(field(), { target: { value: "9.45" } });
    fireEvent.keyDown(field(), { key: "Enter" });
    expect(document.querySelector<HTMLInputElement>('input[type="hidden"][name="start"]')?.value).toBe("09:45");
  });

  it("an emptied field clears the value", () => {
    const onValueChange = vi.fn();
    render(<TimeInput label="Start" defaultValue="10:00" locale="ru-RU" onValueChange={onValueChange} />);
    typeAndLeave("");
    expect(onValueChange).toHaveBeenCalledWith(null);
  });
});
