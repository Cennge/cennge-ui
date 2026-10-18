import { fireEvent, render, screen } from "@testing-library/react";
import { Select, SelectItem } from "./select";

describe("Select", () => {
  it("shows the placeholder, then the chosen value; clear returns to the placeholder", () => {
    const onValueChange = vi.fn();
    render(
      <Select label="Language" placeholder="Pick one" defaultValue="ts" isClearable onValueChange={onValueChange}>
        <SelectItem value="ts">TypeScript</SelectItem>
        <SelectItem value="py">Python</SelectItem>
      </Select>,
    );
    const trigger = screen.getByRole("combobox", { name: "Language" });
    expect(trigger).toHaveTextContent("TypeScript");
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(trigger).toHaveTextContent("Pick one");
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });

  it("marks the trigger invalid and links the error", () => {
    render(
      <Select label="Language" isInvalid errorMessage="Required">
        <SelectItem value="ts">TypeScript</SelectItem>
      </Select>,
    );
    const trigger = screen.getByRole("combobox", { name: "Language" });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAccessibleDescription("Required");
  });
});
