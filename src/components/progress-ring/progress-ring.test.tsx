import { renderToString } from "react-dom/server";
import { render, screen } from "@testing-library/react";
import { CenngeProvider } from "../../provider";
import { ProgressRing } from "./progress-ring";

describe("ProgressRing", () => {
  it("is a meter named by its label, its value kept within the goal and the text saying the rest", () => {
    render(<ProgressRing aria-label="Commits this week" value={34} max={40} />);
    const meter = screen.getByRole("meter", { name: "Commits this week" });
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "40");
    expect(meter).toHaveAttribute("aria-valuenow", "34");
    expect(meter).toHaveAttribute("aria-valuetext", "34 of 40");
  });

  it("past the goal: the meter stops at it, the text says by how much, and the ring laps with a shadowed end", () => {
    const { container } = render(<ProgressRing aria-label="Reviews" value={9} max={6} />);
    const meter = screen.getByRole("meter", { name: "Reviews" });
    expect(meter).toHaveAttribute("aria-valuenow", "6");
    expect(meter).toHaveAttribute("aria-valuetext", "9 of 6, 3 over");
    expect(container.querySelector('[data-slot="progress-ring-overlap"]')).not.toBeNull();
  });

  it("several goals: a group named by the label, a meter per ring in order, each in the next chart colour", () => {
    const { container } = render(
      <ProgressRing
        aria-label="Goals this week"
        rings={[
          { label: "Commits", value: 34, max: 40 },
          { label: "Deploys", value: 2, max: 5, color: "success" },
        ]}
      />,
    );
    const group = screen.getByRole("group", { name: "Goals this week" });
    const meters = screen.getAllByRole("meter");
    expect(meters.map((meter) => meter.getAttribute("aria-label"))).toEqual(["Commits", "Deploys"]);
    expect(group).toContainElement(meters[0]!);
    const colors = Array.from(container.querySelectorAll("svg > g")).map((g) => (g as SVGGElement).style.color);
    expect(colors).toEqual(["var(--cennge-chart-1)", "var(--cennge-success)"]);
  });

  it("nothing done draws no indicator, only the track", () => {
    const { container } = render(<ProgressRing aria-label="Releases" value={0} max={4} />);
    expect(container.querySelector('[data-slot="progress-ring-indicator"]')).toBeNull();
    expect(container.querySelector('[data-slot="progress-ring-track"]')).not.toBeNull();
  });

  it("the middle shows what it is given, inside the innermost ring; formatValue writes what is heard", () => {
    render(
      <ProgressRing aria-label="CI minutes" value={1820} max={2000} formatValue={(value, max) => `${max - value} minutes left`}>
        <span>180 left</span>
      </ProgressRing>,
    );
    expect(screen.getByText("180 left")).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: "CI minutes" })).toHaveAttribute("aria-valuetext", "180 minutes left");
  });

  it("crossing the goal keeps the first lap and adds a second over it", () => {
    const { container, rerender } = render(<ProgressRing aria-label="Commits" value={38} max={40} />);
    const first = container.querySelector('[data-slot="progress-ring-indicator"]');
    rerender(<ProgressRing aria-label="Commits" value={46} max={40} />);
    expect(container.querySelector('[data-slot="progress-ring-indicator"]')).toBe(first);
    expect(first).toHaveAttribute("stroke-dashoffset", "0");
    expect(container.querySelector('[data-slot="progress-ring-lap"]')).not.toBeNull();
  });

  it("an empty list of rings is one empty ring; many rings narrow to fit, every one drawn", () => {
    render(
      <ProgressRing aria-label="No goals yet" rings={[]}>
        <span>Set a goal</span>
      </ProgressRing>,
    );
    expect(screen.getByRole("meter", { name: "No goals yet" })).toHaveAttribute("aria-valuetext", "0 of 100");
    const many = Array.from({ length: 7 }, (_, i) => ({ label: `Goal ${i + 1}`, value: 3, max: 5 }));
    const { container } = render(
      <ProgressRing aria-label="Seven goals" rings={many} size="md" strokeWidth={12}>
        <span>7</span>
      </ProgressRing>,
    );
    const radii = Array.from(container.querySelectorAll('[data-slot="progress-ring-track"]')).map((track) => Number(track.getAttribute("r")));
    expect(radii).toHaveLength(7);
    expect(Math.min(...radii)).toBeGreaterThan(0);
    expect(parseFloat((container.querySelector('[data-slot="progress-ring-content"]') as HTMLElement).style.maxWidth)).toBeGreaterThan(20);
  });

  it("the middle is for the eye; values that are not numbers count as nothing", () => {
    const { container } = render(
      <ProgressRing aria-label="Water" value={Number.NaN} max={0}>
        <span>0 ml</span>
      </ProgressRing>,
    );
    expect(container.querySelector('[data-slot="progress-ring-content"]')).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("meter", { name: "Water" })).toHaveAttribute("aria-valuetext", "0 of 1");
  });

  it("takes its words for another language", () => {
    render(<ProgressRing aria-label="Schritte" value={12} max={10} labels={{ of: (v, m) => `${v} von ${m}`, over: (a) => `${a} mehr` }} />);
    expect(screen.getByRole("meter", { name: "Schritte" })).toHaveAttribute("aria-valuetext", "12 von 10, 2 mehr");
  });

  it("writes numbers in the provider's locale, and renders on the server", () => {
    render(
      <CenngeProvider locale="de-DE">
        <ProgressRing aria-label="Steps" value={8400} max={10000} />
      </CenngeProvider>,
    );
    expect(screen.getByRole("meter", { name: "Steps" })).toHaveAttribute("aria-valuetext", "8.400 of 10.000");
    expect(renderToString(<ProgressRing aria-label="Steps" value={8400} max={10000} />)).toContain('role="meter"');
  });
});
