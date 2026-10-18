import { render, screen } from "@testing-library/react";
import { Indicator } from "./indicator";

describe("Indicator", () => {
  it("caps large numbers at max", () => {
    render(
      <Indicator content={150}>
        <span>Inbox</span>
      </Indicator>,
    );
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("is decorative by default and readable when given a label", () => {
    const { rerender } = render(
      <Indicator content={3}>
        <span>Inbox</span>
      </Indicator>,
    );
    expect(screen.getByText("3").closest('[aria-hidden="true"]')).not.toBeNull();

    rerender(
      <Indicator content={3} label="3 unread notifications">
        <span>Inbox</span>
      </Indicator>,
    );
    expect(screen.getByText("3 unread notifications")).toHaveClass("sr-only");
  });

  it("marks itself invisible for the hide animation", () => {
    const { container } = render(
      <Indicator isInvisible>
        <span>Avatar</span>
      </Indicator>,
    );
    expect(container.querySelector("[data-invisible]")).not.toBeNull();
  });
});
