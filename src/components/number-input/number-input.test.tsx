import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { NumberInput } from "./number-input";

const field = () => screen.getByRole("spinbutton");

describe("NumberInput", () => {
  it("is a labelled spinbutton exposing value, bounds and formatted text", () => {
    render(<NumberInput label="Stars" defaultValue={1234.5} min={0} max={10000} />);
    const input = screen.getByRole("spinbutton", { name: "Stars" });
    expect(input).toHaveValue("1,234.5");
    expect(input).toHaveAttribute("aria-valuenow", "1234.5");
    expect(input).toHaveAttribute("aria-valuemin", "0");
    expect(input).toHaveAttribute("aria-valuemax", "10000");
    expect(input).toHaveAttribute("aria-valuetext", "1,234.5");
  });

  it("reports parsed values while typing and refuses letters", () => {
    const onValueChange = vi.fn();
    render(<NumberInput label="Stars" onValueChange={onValueChange} />);
    fireEvent.change(field(), { target: { value: "42" } });
    expect(onValueChange).toHaveBeenLastCalledWith(42);
    fireEvent.change(field(), { target: { value: "42x" } });
    expect(field()).toHaveValue("42");
    fireEvent.change(field(), { target: { value: "" } });
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("steps with arrows and PageUp/PageDown, Home/End jump to the bounds", () => {
    render(<NumberInput label="Stars" defaultValue={5} min={0} max={100} />);
    fireEvent.keyDown(field(), { key: "ArrowUp" });
    expect(field()).toHaveValue("6");
    fireEvent.keyDown(field(), { key: "PageUp" });
    expect(field()).toHaveValue("16");
    fireEvent.keyDown(field(), { key: "PageDown" });
    fireEvent.keyDown(field(), { key: "ArrowDown" });
    expect(field()).toHaveValue("5");
    fireEvent.keyDown(field(), { key: "End" });
    expect(field()).toHaveValue("100");
    fireEvent.keyDown(field(), { key: "ArrowUp" });
    expect(field()).toHaveValue("100");
    fireEvent.keyDown(field(), { key: "Home" });
    expect(field()).toHaveValue("0");
  });

  it("steps decimals without floating point noise", () => {
    render(<NumberInput label="Ratio" defaultValue={0.2} step={0.1} />);
    fireEvent.keyDown(field(), { key: "ArrowUp" });
    expect(field()).toHaveAttribute("aria-valuenow", "0.3");
    expect(field()).toHaveValue("0.3");
  });

  it("clamps and formats on blur", () => {
    const onValueChange = vi.fn();
    render(<NumberInput label="Stars" min={0} max={1000} onValueChange={onValueChange} />);
    fireEvent.focus(field());
    fireEvent.change(field(), { target: { value: "5000" } });
    fireEvent.blur(field());
    expect(onValueChange).toHaveBeenLastCalledWith(1000);
    expect(field()).toHaveValue("1,000");
  });

  it("reverts an unfinished value like a lone minus sign", () => {
    render(<NumberInput label="Delta" defaultValue={3} />);
    fireEvent.focus(field());
    fireEvent.change(field(), { target: { value: "-" } });
    fireEvent.blur(field());
    expect(field()).toHaveValue("3");
  });

  it("parses and formats per locale", () => {
    render(<NumberInput label="Цена" locale="ru-RU" defaultValue={null} />);
    fireEvent.focus(field());
    fireEvent.change(field(), { target: { value: "1234,5" } });
    fireEvent.blur(field());
    expect(field()).toHaveAttribute("aria-valuenow", "1234.5");
    expect((field() as HTMLInputElement).value).toMatch(/^1\s234,5$/);
  });

  it("supports currency and percent formats", () => {
    render(
      <>
        <NumberInput label="Price" defaultValue={1234.5} formatOptions={{ style: "currency", currency: "USD" }} />
        <NumberInput label="Share" defaultValue={0.25} formatOptions={{ style: "percent" }} />
      </>,
    );
    expect(screen.getByRole("spinbutton", { name: "Price" })).toHaveValue("$1,234.50");
    const share = screen.getByRole("spinbutton", { name: "Share" });
    expect(share).toHaveValue("25%");
    fireEvent.keyDown(share, { key: "ArrowUp" });
    expect(share).toHaveValue("26%");
    expect(share).toHaveAttribute("aria-valuenow", "0.26");
  });

  it("disables the buttons at the bounds", () => {
    render(<NumberInput label="Seats" defaultValue={1} min={1} max={3} />);
    expect(screen.getByRole("button", { name: "Decrease" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Increase" })).toBeEnabled();
  });

  it("submits the raw number through a hidden input", () => {
    render(<NumberInput label="Budget" name="budget" defaultValue={12000} />);
    const hidden = document.querySelector('input[type="hidden"][name="budget"]');
    expect(hidden).toHaveValue("12000");
    expect(field()).toHaveValue("12,000");
  });

  it("works controlled", () => {
    function Controlled() {
      const [value, setValue] = useState<number | null>(10);
      return (
        <>
          <NumberInput label="Qty" value={value} onValueChange={setValue} />
          <button type="button" onClick={() => setValue(99)}>
            set
          </button>
        </>
      );
    }
    render(<Controlled />);
    fireEvent.keyDown(field(), { key: "ArrowUp" });
    expect(field()).toHaveValue("11");
    fireEvent.click(screen.getByRole("button", { name: "set" }));
    expect(field()).toHaveValue("99");
  });

  it("read-only ignores stepping", () => {
    render(<NumberInput label="Locked" defaultValue={7} isReadOnly />);
    fireEvent.keyDown(field(), { key: "ArrowUp" });
    expect(field()).toHaveValue("7");
  });
});
