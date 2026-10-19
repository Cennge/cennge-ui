import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Toaster, toast } from "./index";

// Radix Toast 1.3.1 shows nothing on React 17: in place of the missing React.startTransition it uses a
// function that drops the update, so toasts never learn where the viewport is (radix-ui/primitives#4228).
// When Radix fixes it these report "Expect test to fail"; then make them plain `it` again.
const itRenders = React.version.startsWith("17.") ? it.fails : it;

afterEach(() => {
  act(() => toast.dismiss());
});

describe("toast", () => {
  itRenders("shows a toast from a plain call, outside any component", () => {
    render(<Toaster />);
    act(() => {
      toast.success("Deployed", { description: "v1.2.0 is live" });
    });
    expect(screen.getByText("Deployed")).toBeInTheDocument();
    expect(screen.getByText("v1.2.0 is live")).toBeInTheDocument();
  });

  itRenders("updates the same toast when the id is reused", () => {
    render(<Toaster />);
    act(() => {
      toast("Uploading…", { id: "upload" });
      toast.success("Uploaded", { id: "upload" });
    });
    expect(screen.queryByText("Uploading…")).toBeNull();
    expect(screen.getByText("Uploaded")).toBeInTheDocument();
  });

  itRenders("toast.promise switches from loading to the result", async () => {
    render(<Toaster />);
    let resolve!: (value: string) => void;
    const promise = new Promise<string>((r) => (resolve = r));
    act(() => {
      toast.promise(promise, { loading: "Saving…", success: (v) => `Saved ${v}`, error: "Failed" });
    });
    expect(screen.getByText("Saving…")).toBeInTheDocument();
    await act(async () => {
      resolve("draft");
      await promise;
    });
    expect(screen.getByText("Saved draft")).toBeInTheDocument();
  });

  itRenders("runs the action callback", () => {
    const onUndo = vi.fn();
    render(<Toaster />);
    act(() => {
      toast("Message archived", { action: { label: "Undo", onClick: onUndo } });
    });
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });
});
