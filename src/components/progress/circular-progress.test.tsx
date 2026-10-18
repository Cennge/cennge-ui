import { render, screen } from "@testing-library/react";
import { CircularProgress } from "./circular-progress";

describe("CircularProgress", () => {
  it("is a progressbar named by its label, with the value as text", () => {
    render(<CircularProgress label="Test coverage" value={87} showValue />);
    const bar = screen.getByRole("progressbar", { name: "Test coverage" });
    expect(bar).toHaveAttribute("aria-valuenow", "87");
    expect(bar).toHaveAttribute("aria-valuetext", "87%");
    expect(screen.getByText("87%")).toBeInTheDocument();
  });

  it("is indeterminate without a value", () => {
    render(<CircularProgress aria-label="Cloning" />);
    expect(screen.getByRole("progressbar", { name: "Cloning" })).not.toHaveAttribute("aria-valuenow");
  });
});
