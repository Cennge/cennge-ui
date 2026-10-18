import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";
import { Tooltip } from "../tooltip";
import { Button } from "../button";

describe("Badge", () => {
  it("renders colour and variant classes", () => {
    render(
      <Badge color="success" variant="solid">
        Live
      </Badge>,
    );
    expect(screen.getByText("Live").parentElement).toHaveClass("bg-success", "text-success-foreground");
  });

  it("dot variant renders a coloured, decorative dot", () => {
    const { container } = render(
      <Badge color="danger" variant="dot">
        Offline
      </Badge>,
    );
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).toHaveClass("bg-danger");
  });
});

describe("Tooltip", () => {
  it("works without CenngeProvider", () => {
    render(
      <Tooltip content="Saved" defaultOpen>
        <Button>Save</Button>
      </Tooltip>,
    );
    expect(screen.getByRole("tooltip")).toHaveTextContent("Saved");
  });
});
