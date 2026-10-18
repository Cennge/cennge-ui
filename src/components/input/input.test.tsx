import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Input } from "./input";

describe("Input", () => {
  it("links the label and the description to the input", () => {
    render(<Input label="Email" description="We never share it" />);
    const field = screen.getByLabelText("Email");
    expect(field).toHaveAccessibleDescription("We never share it");
  });

  it("shows the error message instead of the description while invalid", () => {
    render(<Input label="Email" description="Hint" errorMessage="Required" isInvalid />);
    const field = screen.getByLabelText("Email");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("Required");
    expect(screen.queryByText("Hint")).toBeNull();
  });

  it("uncontrolled: clear button empties the field and refocuses it", () => {
    const onValueChange = vi.fn();
    render(<Input label="Name" defaultValue="Ann" isClearable onValueChange={onValueChange} />);
    const field = screen.getByLabelText("Name");
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(field).toHaveValue("");
    expect(field).toHaveFocus();
    expect(onValueChange).toHaveBeenCalledWith("");
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });

  it("controlled: value follows state, clear goes through onValueChange", () => {
    function Controlled() {
      const [value, setValue] = useState("Bob");
      return <Input label="Name" value={value} onValueChange={setValue} isClearable />;
    }
    render(<Controlled />);
    const field = screen.getByLabelText("Name");
    fireEvent.change(field, { target: { value: "Bobby" } });
    expect(field).toHaveValue("Bobby");
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(field).toHaveValue("");
  });

  it("isRequired and isDisabled reach the native input", () => {
    render(<Input label="Code" isRequired isDisabled />);
    const field = screen.getByLabelText(/Code/);
    expect(field).toBeRequired();
    expect(field).toBeDisabled();
  });
});
