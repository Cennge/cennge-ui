import { render, screen, within } from "@testing-library/react";
import { Timeline, TimelineItem } from "./timeline";

describe("Timeline", () => {
  it("is an ordered list with machine-readable times", () => {
    render(
      <Timeline aria-label="Releases">
        <TimelineItem title="v0.2.0" time="Oct 18" dateTime="2026-10-18">
          Combobox
        </TimelineItem>
        <TimelineItem title="v0.1.0" time="Oct 1" dateTime="2026-10-01" />
      </Timeline>,
    );
    const list = screen.getByRole("list", { name: "Releases" });
    expect(list.tagName).toBe("OL");
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Oct 18").tagName).toBe("TIME");
    expect(screen.getByText("Oct 18")).toHaveAttribute("datetime", "2026-10-18");
    expect(screen.getByText("Combobox")).toBeInTheDocument();
  });

  it("uses <time> only with a machine-readable dateTime", () => {
    render(
      <Timeline>
        <TimelineItem title="Planned" time="Next month" />
      </Timeline>,
    );
    expect(screen.getByText("Next month").tagName).toBe("SPAN");
  });

  it("with activeIndex: marks the current item and announces upcoming ones", () => {
    render(
      <Timeline activeIndex={1} aria-label="Order">
        <TimelineItem title="Ordered" />
        <TimelineItem title="Shipped" />
        <TimelineItem title="Delivered" />
      </Timeline>,
    );
    const [ordered, shipped, delivered] = screen.getAllByRole("listitem");
    expect(shipped).toHaveAttribute("aria-current", "step");
    expect(ordered).toHaveAttribute("data-state", "done");
    expect(delivered).toHaveAttribute("data-state", "upcoming");
    expect(delivered).toHaveTextContent("Delivered, upcoming");
  });

  it("draws no line after the last item and supports dashed lines", () => {
    const { container } = render(
      <Timeline>
        <TimelineItem title="Planned" lineVariant="dashed" />
        <TimelineItem title="Last" />
      </Timeline>,
    );
    const lines = container.querySelectorAll('[data-slot="line"]');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toHaveClass("border-dashed");
  });

  it("horizontal timelines are focusable so they can be scrolled from the keyboard", () => {
    render(
      <Timeline orientation="horizontal" aria-label="Roadmap">
        <TimelineItem title="Q1" />
      </Timeline>,
    );
    expect(screen.getByRole("list", { name: "Roadmap" })).toHaveAttribute("tabindex", "0");
  });
});
