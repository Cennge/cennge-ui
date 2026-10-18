import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "../button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";

function Example() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogBody>Body</DialogBody>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("opens from the trigger with an accessible name and description", () => {
    render(<Example />);
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName("Delete project");
    expect(dialog).toHaveAccessibleDescription("This cannot be undone.");
  });

  it("closes with the close button", () => {
    render(<Example />);
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes on Escape", () => {
    render(<Example />);
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
