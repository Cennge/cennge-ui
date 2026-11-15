import { render, screen } from "@testing-library/react";
import { CenngeProvider } from "../../provider";
import { StatTile } from "./stat-tile";

const delta = (container: HTMLElement) => container.querySelector('[data-slot="stat-tile-delta"]')!;

describe("StatTile", () => {
  it("writes the value in the locale, the unit after it, and a signed change", () => {
    const { container } = render(<StatTile label="CI runs" value={3157} delta={12} deltaLabel="vs last week" />);
    expect(screen.getByText("3,157")).toBeInTheDocument();
    expect(delta(container)).toHaveTextContent("+12");
    expect(screen.getByText("vs last week")).toBeInTheDocument();
  });

  it("an increase is good news by default; with goodDirection down a fall is, written with a true minus", () => {
    const { container: up } = render(<StatTile label="Commits" value={34} delta={6} />);
    expect(delta(up)).toHaveAttribute("data-tone", "good");
    const { container: down } = render(<StatTile label="Button, gzip" value={2.1} unit="KB" delta={-0.3} goodDirection="down" />);
    expect(delta(down)).toHaveAttribute("data-tone", "good");
    expect(delta(down)).toHaveTextContent("−0.3 KB");
    const { container: worse } = render(<StatTile label="Open issues" value={23} delta={4} goodDirection="down" />);
    expect(delta(worse)).toHaveAttribute("data-tone", "bad");
  });

  it("no change, or a number that is neither good nor bad, stays neutral", () => {
    const { container: zero } = render(<StatTile label="Stars" value={412} delta={0} />);
    expect(delta(zero)).toHaveAttribute("data-tone", "neutral");
    expect(delta(zero)).toHaveTextContent("0");
    const { container: none } = render(<StatTile label="Deploys" value={9} delta={3} goodDirection="none" />);
    expect(delta(none)).toHaveAttribute("data-tone", "neutral");
  });

  it("formatDelta writes the change; the provider's locale writes the numbers", () => {
    const { container } = render(
      <CenngeProvider locale="de-DE">
        <StatTile label="Gewicht" value={81.4} unit="kg" delta={-0.6} goodDirection="down" />
        <StatTile label="Runs" value={3157} delta={12} formatDelta={(change) => `+${change}%`} />
      </CenngeProvider>,
    );
    expect(screen.getByText("81,4")).toBeInTheDocument();
    expect(container.querySelectorAll('[data-slot="stat-tile-delta"]')[0]).toHaveTextContent("−0,6 kg");
    expect(container.querySelectorAll('[data-slot="stat-tile-delta"]')[1]).toHaveTextContent("+12%");
  });

  it("a change too small to show is no change; good or bad is also said to screen readers", () => {
    const { container: noise } = render(<StatTile label="Weight" value={82} unit="kg" delta={0.004} goodDirection="down" />);
    expect(delta(noise)).toHaveAttribute("data-tone", "neutral");
    expect(delta(noise)).toHaveTextContent("0 kg");
    const { container: better } = render(<StatTile label="Weight" value={81.6} unit="kg" delta={-0.4} goodDirection="down" />);
    expect(delta(better)).toHaveTextContent("−0.4 kg, better");
    const { container: worse } = render(<StatTile label="Steps" value={4200} delta={-800} labels={{ bad: "schlechter" }} />);
    expect(delta(worse)).toHaveTextContent("−800, schlechter");
  });

  it("takes the provider's radius, and any element as its value", () => {
    const { container } = render(
      <CenngeProvider radius="sm">
        <StatTile label="Steps" value={<div data-testid="loading" />} />
      </CenngeProvider>,
    );
    expect(container.querySelector('[data-slot="stat-tile"]')).toHaveClass("rounded-small");
    expect(screen.getByTestId("loading").parentElement?.tagName).toBe("DIV");
  });

  it("no delta, no footer; a chart goes under the numbers", () => {
    const { container } = render(<StatTile label="Stars" value={412} chart={<span data-testid="chart" />} />);
    expect(container.querySelector('[data-slot="stat-tile-delta"]')).toBeNull();
    expect(screen.getByTestId("chart")).toBeInTheDocument();
  });
});
