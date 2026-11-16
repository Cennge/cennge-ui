import { fireEvent, render, screen } from "@testing-library/react";
import { Drawer, DrawerContent, DrawerTitle } from "./drawer";

function Sheet(props: Partial<React.ComponentProps<typeof DrawerContent>>) {
  return (
    <Drawer isOpen>
      <DrawerContent placement="bottom" {...props}>
        <DrawerTitle>Add food</DrawerTitle>
      </DrawerContent>
    </Drawer>
  );
}

describe("Drawer as a bottom sheet", () => {
  it("with snap points: as tall as the one it rests at; the handle is a button that steps through them", () => {
    const onChange = vi.fn();
    render(<Sheet snapPoints={[0.9, 0.4]} onSnapPointChange={onChange} />);
    const dialog = screen.getByRole("dialog", { name: "Add food" });
    // Sorted lowest first: it opens at 40%.
    expect(dialog.style.height).toContain("40dvh");
    expect(dialog).toHaveAttribute("data-snap-point", "0");
    fireEvent.click(screen.getByRole("button", { name: "Expand" }));
    expect(onChange).toHaveBeenLastCalledWith(1);
    expect(dialog.style.height).toContain("90dvh");
    fireEvent.click(screen.getByRole("button", { name: "Collapse" }));
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("the arrow keys on the handle step up and down, and stop at the ends", () => {
    render(<Sheet snapPoints={[0.3, 0.6, 0.9]} />);
    const handle = screen.getByRole("button", { name: "Expand" });
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    expect(screen.getByRole("dialog")).toHaveAttribute("data-snap-point", "0");
    for (let i = 0; i < 3; i++) fireEvent.keyDown(screen.getByRole("button", { name: /Expand|Collapse/ }), { key: "ArrowUp" });
    expect(screen.getByRole("dialog")).toHaveAttribute("data-snap-point", "2");
  });

  it("without snap points the handle is a picture, not a control; other edges have none", () => {
    const { rerender } = render(<Sheet />);
    expect(screen.queryByRole("button", { name: /Expand|Collapse/ })).toBeNull();
    expect(document.querySelector('[data-slot="drawer-handle"]')).toHaveAttribute("aria-hidden", "true");
    rerender(
      <Drawer isOpen>
        <DrawerContent placement="right">
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );
    expect(document.querySelector('[data-slot="drawer-grip"]')).toBeNull();
  });

  it("takes its words for another language", () => {
    render(<Sheet snapPoints={[0.4, 0.9]} labels={{ expand: "Vergrößern" }} />);
    expect(screen.getByRole("button", { name: "Vergrößern" })).toBeInTheDocument();
  });
});
