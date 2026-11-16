import { fireEvent, render, screen } from "@testing-library/react";
import { SwipeActions } from "./swipe-actions";

const actions = (log: string[]) => ({
  leadingActions: [{ key: "done", label: "Done", color: "success" as const, onAction: () => log.push("done") }],
  trailingActions: [
    { key: "copy", label: "Copy", onAction: () => log.push("copy") },
    { key: "delete", label: "Delete", color: "danger" as const, onAction: () => log.push("delete") },
  ],
});

describe("SwipeActions", () => {
  it("disabled: no menu to open; a disabled action is disabled in the menu", () => {
    render(
      <SwipeActions label="Oatmeal" {...actions([])} isDisabled>
        Oatmeal
      </SwipeActions>,
    );
    expect(screen.getByRole("button", { name: "Actions for Oatmeal" })).toBeDisabled();
  });

  it("controlled: the open side comes from isOpen, and its actions are in reach", () => {
    render(
      <SwipeActions label="Oatmeal" {...actions([])} isOpen="trailing">
        Oatmeal
      </SwipeActions>,
    );
    const trailing = document.querySelector<HTMLElement>('[data-slot="swipe-actions-trailing"]')!;
    expect(trailing.inert).toBe(false);
    expect(document.querySelector('[data-slot="swipe-actions"]')).toHaveAttribute("data-open", "trailing");
  });

  it("a menu button names the row and lists every action; closed, the swiped-to buttons are out of reach", () => {
    render(
      <SwipeActions label="Oatmeal" {...actions([])}>
        Oatmeal
      </SwipeActions>,
    );
    expect(screen.getByRole("button", { name: "Actions for Oatmeal" })).toBeInTheDocument();
    for (const side of ["leading", "trailing"]) {
      const panel = document.querySelector<HTMLElement>(`[data-slot="swipe-actions-${side}"]`)!;
      // Set as a property, so React 17 and 18 keep it too.
      expect(panel.inert).toBe(true);
      expect(panel).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("a mouse does not swipe: it has the menu", () => {
    render(
      <SwipeActions label="Oatmeal" {...actions([])}>
        Oatmeal
      </SwipeActions>,
    );
    const row = document.querySelector<HTMLElement>('[data-slot="swipe-actions-row"]')!;
    fireEvent.pointerDown(row, { pointerId: 1, pointerType: "mouse", clientX: 200, clientY: 10 });
    fireEvent.pointerMove(row, { pointerId: 1, pointerType: "mouse", clientX: 60, clientY: 10 });
    expect(row.style.transform).toBe("");
  });

  it("no menu without actions or when hidden; the words are yours", () => {
    const { rerender } = render(<SwipeActions label="Oatmeal">Oatmeal</SwipeActions>);
    expect(screen.queryByRole("button")).toBeNull();
    rerender(
      <SwipeActions label="Oatmeal" {...actions([])} labels={{ menu: (label) => `Aktionen für ${label}` }}>
        Oatmeal
      </SwipeActions>,
    );
    expect(screen.getByRole("button", { name: "Aktionen für Oatmeal" })).toBeInTheDocument();
    rerender(
      <SwipeActions label="Oatmeal" {...actions([])} showMenu={false}>
        Oatmeal
      </SwipeActions>,
    );
    expect(screen.queryByRole("button", { name: /Oatmeal/ })).toBeNull();
  });
});
