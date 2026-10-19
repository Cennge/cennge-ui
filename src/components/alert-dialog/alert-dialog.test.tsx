import { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Button } from "../button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

function Example({ onAction }: { onAction?: () => unknown }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button>Delete repository</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete cennge-ui?</AlertDialogTitle>
          <AlertDialogDescription>Issues and releases go with it.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction color="danger" onAction={onAction}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const open = () => fireEvent.click(screen.getByRole("button", { name: "Delete repository" }));
const dialog = () => screen.queryByRole("alertdialog");

function deferred() {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("AlertDialog", () => {
  it("opens as an alertdialog with a name and description; focus starts on Cancel", () => {
    render(<Example />);
    open();
    expect(dialog()).toHaveAccessibleName("Delete cennge-ui?");
    expect(dialog()).toHaveAccessibleDescription("Issues and releases go with it.");
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("Cancel and Escape close it; a press outside does not", () => {
    render(<Example />);
    open();
    fireEvent.pointerDown(document.body);
    expect(dialog()).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(dialog()).toBeNull();
    open();
    fireEvent.keyDown(dialog()!, { key: "Escape" });
    expect(dialog()).toBeNull();
  });

  it("runs a synchronous action and closes", () => {
    const onAction = vi.fn();
    render(<Example onAction={onAction} />);
    open();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(dialog()).toBeNull();
  });

  it("stays open and busy while the action's promise runs, then closes", async () => {
    const task = deferred();
    const onAction = vi.fn(() => task.promise);
    render(<Example onAction={onAction} />);
    open();
    const action = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(action);

    expect(dialog()).toBeInTheDocument();
    expect(action).toHaveAttribute("aria-busy", "true");
    expect(action).toHaveAttribute("aria-disabled", "true");
    expect(action).toBeEnabled(); // still focusable
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    fireEvent.keyDown(dialog()!, { key: "Escape" });
    expect(dialog()).toBeInTheDocument();
    fireEvent.click(action);
    expect(onAction).toHaveBeenCalledTimes(1);

    await act(async () => task.resolve());
    expect(dialog()).toBeNull();
  });

  it("stays open when the action fails, ready to retry or cancel", async () => {
    const task = deferred();
    render(<Example onAction={() => task.promise} />);
    open();
    const action = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(action);
    await act(async () => task.reject(new Error("network")));
    expect(dialog()).toBeInTheDocument();
    expect(action).not.toHaveAttribute("aria-busy");
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
  });

  it("works controlled", () => {
    function Controlled() {
      const [isOpen, setOpen] = useState(true);
      return (
        <>
          <p data-testid="state">{String(isOpen)}</p>
          <AlertDialog isOpen={isOpen} onOpenChange={setOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out?</AlertDialogTitle>
                <AlertDialogDescription>You can sign in again any time.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Stay</AlertDialogCancel>
                <AlertDialogAction>Sign out</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    }
    render(<Controlled />);
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(screen.getByTestId("state")).toHaveTextContent("false");
    expect(dialog()).toBeNull();
  });

  it("explains a part used outside AlertDialog", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<AlertDialogAction>Delete</AlertDialogAction>)).toThrow(
      "<AlertDialogAction> must be used inside <AlertDialog>.",
    );
    spy.mockRestore();
  });
});
