import { render, screen } from "@testing-library/react";
import { RangeMeter } from "./range-meter";

const meter = (name: string) => screen.getByRole("meter", { name });

describe("RangeMeter", () => {
  it("under the floor: how much is left, in the status and in the meter's text", () => {
    const { container } = render(<RangeMeter label="Test coverage" value={72} low={80} max={100} unit="%" />);
    expect(meter("Test coverage")).toHaveAttribute("aria-valuetext", "72%, goal 80%, 8% to go");
    expect(screen.getByText("8% to go")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("data-status", "below");
  });

  it("between floor and ceiling: in range, the range banded on the bar and both ends marked", () => {
    const { container } = render(<RangeMeter label="Build time" value={48} low={30} high={60} unit="s" />);
    expect(meter("Build time")).toHaveAttribute("aria-valuetext", "48 s, goal 30–60 s, In range");
    expect(container.firstElementChild).toHaveAttribute("data-status", "within");
    expect(container.querySelectorAll('[data-slot="range-meter-tick"]')).toHaveLength(2);
  });

  it("past the ceiling: by how much, the part past it striped, the meter's value kept within its range", () => {
    const { container } = render(<RangeMeter label="CI minutes" value={2136} high={2000} unit="min" />);
    expect(meter("CI minutes")).toHaveAttribute("aria-valuetext", "2,136 min, goal 2,000 min, 136 min over");
    expect(Number(meter("CI minutes").getAttribute("aria-valuenow"))).toBeLessThanOrEqual(Number(meter("CI minutes").getAttribute("aria-valuemax")));
    expect(container.querySelector('[data-slot="range-meter-excess"]')).not.toBeNull();
    expect(container.firstElementChild).toHaveAttribute("data-status", "over");
  });

  it("a ceiling alone, kept under: the room left; a floor alone, reached: goal reached", () => {
    render(
      <>
        <RangeMeter label="Bundle" value={2.1} high={3} unit="KB" />
        <RangeMeter label="Reviews" value={6} low={5} />
      </>,
    );
    expect(screen.getByText("0.9 KB left")).toBeInTheDocument();
    expect(meter("Bundle")).toHaveAttribute("aria-valuetext", "2.1 KB, goal 3 KB, 0.9 KB left");
    expect(screen.getByText("Goal reached")).toBeInTheDocument();
  });

  it("short of the goal is grey, not the accent; a colour of the chart palette is taken as it is", () => {
    const { container } = render(
      <>
        <RangeMeter label="Protein" value={112} low={150} unit="g" />
        <RangeMeter label="Carbs" value={180} low={150} high={250} color="chart-2" />
      </>,
    );
    const fills = container.querySelectorAll<HTMLElement>('[role="meter"] > span:not([data-slot])');
    expect(fills[0]).toHaveClass("bg-default-500");
    expect(fills[fills.length - 1]!.style.background).toBe("var(--cennge-chart-2)");
  });

  it("with no goal and no max there is no bar to misread, only the amount", () => {
    const { container } = render(<RangeMeter label="Water" value={1200} unit="ml" />);
    expect(screen.queryByRole("meter")).toBeNull();
    expect(container.firstElementChild).toHaveAttribute("data-status", "none");
    expect(screen.getByText("1,200")).toBeVisible();
  });

  it("marks only inside the bar; a floor above its ceiling is read the other way round", () => {
    const { container } = render(<RangeMeter label="Sugar" value={20} low={0} high={50} max={60} />);
    expect(container.querySelectorAll('[data-slot="range-meter-tick"]')).toHaveLength(1);
    render(<RangeMeter label="Calories" value={1900} low={2200} high={1800} />);
    expect(meter("Calories")).toHaveAttribute("aria-valuetext", "1,900, goal 1,800–2,200, In range");
  });

  it("the bar ends a quarter past the goal by default, or at the value when it is further", () => {
    render(
      <>
        <RangeMeter label="A" value={10} high={80} />
        <RangeMeter label="B" value={150} high={80} />
      </>,
    );
    expect(meter("A")).toHaveAttribute("aria-valuemax", "100");
    expect(meter("B")).toHaveAttribute("aria-valuemax", "150");
  });

  it("takes its own words, and an aria-label instead of the visible label", () => {
    render(<RangeMeter label="Белок" aria-label="Protein" value={112} low={150} unit="g" labels={{ toGo: (amount) => `ещё ${amount}`, goal: (goal) => `цель ${goal}` }} />);
    expect(screen.getByText("ещё 38 g")).toBeInTheDocument();
    expect(meter("Protein")).toHaveAttribute("aria-valuetext", "112 g, цель 150 g, ещё 38 g");
    expect(meter("Protein")).toBeInTheDocument();
  });
});
