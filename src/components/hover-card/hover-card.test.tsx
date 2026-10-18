import { render, screen } from "@testing-library/react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

describe("HoverCard", () => {
  it("keeps the trigger a normal link and shows the card when open", () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger>
          <a href="https://github.com/Cennge">@Cennge</a>
        </HoverCardTrigger>
        <HoverCardContent>20 repositories</HoverCardContent>
      </HoverCard>,
    );
    expect(screen.getByRole("link", { name: "@Cennge" })).toHaveAttribute("href", "https://github.com/Cennge");
    expect(screen.getByText("20 repositories")).toBeInTheDocument();
  });

  it("renders nothing extra while closed", () => {
    render(
      <HoverCard>
        <HoverCardTrigger>
          <a href="#user">@Cennge</a>
        </HoverCardTrigger>
        <HoverCardContent>20 repositories</HoverCardContent>
      </HoverCard>,
    );
    expect(screen.queryByText("20 repositories")).toBeNull();
  });
});
