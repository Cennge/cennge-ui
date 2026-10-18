import { act, fireEvent, render, screen } from "@testing-library/react";
import { Toaster, toast } from "./index";

afterEach(() => {
  act(() => toast.dismiss());
});

describe("toast", () => {
  it("shows a toast from a plain call, outside any component", () => {
    render(<Toaster />);
    act(() => {
      toast.success("Deployed", { description: "v1.2.0 is live" });
    });
    expect(screen.getByText("Deployed")).toBeInTheDocument();
    expect(screen.getByText("v1.2.0 is live")).toBeInTheDocument();
  });

  it("updates the same toast when the id is reused", () => {
    render(<Toaster />);
    act(() => {
      toast("Uploading…", { id: "upload" });
      toast.success("Uploaded", { id: "upload" });
    });
    expect(screen.queryByText("Uploading…")).toBeNull();
    expect(screen.getByText("Uploaded")).toBeInTheDocument();
  });

  it("toast.promise switches from loading to the result", async () => {
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

  it("runs the action callback", () => {
    const onUndo = vi.fn();
    render(<Toaster />);
    act(() => {
      toast("Message archived", { action: { label: "Undo", onClick: onUndo } });
    });
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });
});
