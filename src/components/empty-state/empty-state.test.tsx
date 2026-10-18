import { render, screen } from "@testing-library/react";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("shows title, description and actions; the icon is decorative", () => {
    const { container } = render(
      <EmptyState
        icon={<svg data-testid="icon" />}
        title="No open issues"
        description="Everything is done here."
        actions={<button type="button">New issue</button>}
      />,
    );
    expect(screen.getByText("No open issues")).toBeInTheDocument();
    expect(screen.getByText("Everything is done here.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New issue" })).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).toContainElement(screen.getByTestId("icon"));
  });
});
