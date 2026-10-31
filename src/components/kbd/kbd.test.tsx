import { render, screen } from "@testing-library/react";
import { Kbd } from "./kbd";

describe("Kbd", () => {
  it("draws named keys as symbols, each keeping its full name for screen readers and on hover", () => {
    render(<Kbd keys={["command", "shift"]}>K</Kbd>);
    const kbd = screen.getByText("K").closest("kbd");
    expect(kbd).not.toBeNull();
    for (const name of ["Command", "Shift"]) {
      const key = screen.getByTitle(name);
      expect(key.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
      expect(key).toHaveTextContent(name);
    }
    // Read out as "Command Shift K".
    expect(kbd?.textContent).toBe("Command Shift K");
  });

  it("writes out keys that are words, as on the key itself", () => {
    render(<Kbd keys={["ctrl", "escape"]} />);
    expect(screen.getByTitle("Control")).toHaveTextContent("Ctrl");
    expect(screen.getByTitle("Escape")).toHaveTextContent("Esc");
    expect(screen.getByTitle("Escape").querySelector("svg")).toBeNull();
  });

  it("draws every named symbol key, none of them empty", () => {
    const keys = ["command", "shift", "option", "enter", "tab", "backspace", "delete", "up", "down", "left", "right"] as const;
    const { container } = render(<Kbd keys={[...keys]} />);
    const paths = container.querySelectorAll("path");
    expect(paths).toHaveLength(keys.length);
    for (const path of paths) expect(path.getAttribute("d")).toMatch(/^M/);
  });

  it("works with plain text only", () => {
    render(<Kbd>Esc</Kbd>);
    expect(screen.getByText("Esc").tagName).toBe("KBD");
  });
});
