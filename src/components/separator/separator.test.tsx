import { render, screen } from "@testing-library/react";
import { Separator } from "./separator";

describe("Separator", () => {
  it("is decorative by default, so screen readers skip it", () => {
    render(<Separator data-testid="line" />);
    expect(screen.getByTestId("line")).toHaveAttribute("role", "none");
  });

  it("exposes a vertical separator when it carries meaning", () => {
    render(<Separator orientation="vertical" isDecorative={false} />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("renders a label between two lines", () => {
    render(<Separator>or</Separator>);
    expect(screen.getByText("or")).toBeInTheDocument();
  });
});
