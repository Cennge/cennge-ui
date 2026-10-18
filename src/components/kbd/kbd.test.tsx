import { render, screen } from "@testing-library/react";
import { Kbd } from "./kbd";

describe("Kbd", () => {
  it("renders a <kbd> with named keys as symbols that keep their full name", () => {
    render(<Kbd keys={["command", "shift"]}>K</Kbd>);
    const kbd = screen.getByText("K").closest("kbd");
    expect(kbd).not.toBeNull();
    expect(screen.getByTitle("Command")).toHaveTextContent("⌘");
    expect(screen.getByTitle("Shift")).toHaveTextContent("⇧");
  });

  it("works with plain text only", () => {
    render(<Kbd>Esc</Kbd>);
    expect(screen.getByText("Esc").tagName).toBe("KBD");
  });
});
