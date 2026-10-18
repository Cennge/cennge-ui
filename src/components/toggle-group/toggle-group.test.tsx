import { fireEvent, render, screen } from "@testing-library/react";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

describe("ToggleGroup", () => {
  it("single: switches the selection and refuses to become empty", () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup aria-label="View" defaultValue="code" onValueChange={onValueChange}>
        <ToggleGroupItem value="code">Code</ToggleGroupItem>
        <ToggleGroupItem value="preview">Preview</ToggleGroupItem>
      </ToggleGroup>,
    );
    const code = screen.getByRole("radio", { name: "Code" });
    const preview = screen.getByRole("radio", { name: "Preview" });
    expect(code).toHaveAttribute("aria-checked", "true");

    fireEvent.click(preview);
    expect(onValueChange).toHaveBeenLastCalledWith("preview");
    expect(preview).toHaveAttribute("aria-checked", "true");

    fireEvent.click(preview); // clicking the selected item keeps it selected
    expect(preview).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("single + isDeselectable: clicking the selected item clears it", () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup aria-label="Filter" defaultValue="open" isDeselectable onValueChange={onValueChange}>
        <ToggleGroupItem value="open">Open</ToggleGroupItem>
      </ToggleGroup>,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Open" }));
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("multiple: toggles items independently", () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup selectionMode="multiple" aria-label="Labels" onValueChange={onValueChange}>
        <ToggleGroupItem value="bug">bug</ToggleGroupItem>
        <ToggleGroupItem value="docs">docs</ToggleGroupItem>
      </ToggleGroup>,
    );
    fireEvent.click(screen.getByRole("button", { name: "bug" }));
    fireEvent.click(screen.getByRole("button", { name: "docs" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["bug", "docs"]);
    expect(screen.getByRole("button", { name: "bug" })).toHaveAttribute("aria-pressed", "true");
  });
});
