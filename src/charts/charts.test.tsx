import { renderToString } from "react-dom/server";
import { render, screen } from "@testing-library/react";
import { CenngeProvider } from "../provider";
import { BarChart } from "./bar-chart";
import { chartColor } from "./colors";
import { DonutChart } from "./donut-chart";
import { LineChart } from "./line-chart";
import { Sparkline } from "./sparkline";
import { movingAverage } from "./trend";

const data = [
  { month: "Jan", stars: 120, forks: 14 },
  { month: "Feb", stars: 1280, forks: 31 },
];
const series = [
  { key: "stars", label: "Stars" },
  { key: "forks", label: "Forks" },
] as const;

describe("chartColor", () => {
  it("gives a series its palette slot, grey past the eighth, and takes theme and CSS colours", () => {
    expect(chartColor(undefined, 0)).toBe("var(--cennge-chart-1)");
    expect(chartColor(undefined, 7)).toBe("var(--cennge-chart-8)");
    expect(chartColor(undefined, 8)).toBe("var(--cennge-default-500)");
    expect(chartColor("chart-3", 0)).toBe("var(--cennge-chart-3)");
    expect(chartColor("danger", 0)).toBe("var(--cennge-danger)");
    expect(chartColor("default", 0)).toBe("var(--cennge-default-500)");
    expect(chartColor("#0ea5e9", 0)).toBe("#0ea5e9");
  });
});

describe("BarChart", () => {
  it("sends the server its legend, axes and data table: only the bars wait for the browser", () => {
    const html = renderToString(<BarChart aria-label="Stars and forks" data={data} index="month" indexLabel="Month" series={series} />);
    expect(html).toContain('aria-label="Stars and forks"');
    expect(html).toContain("<caption>Stars and forks</caption>");
    expect(html).toContain('<th scope="col">Month</th>');
    expect(html).toContain('<th scope="row">Feb</th><td>1,280</td><td>31</td>');
    // Axis ticks, short; the legend names both series.
    expect(html).toContain(">1.5K<");
    expect(html).toContain(">Forks<");
    expect(html).not.toContain('data-slot="chart-marks"');
  });

  it("writes numbers in the provider's locale, and takes formats of its own", () => {
    render(
      <CenngeProvider locale="ru-RU">
        <BarChart aria-label="Звёзды" data={data} index="month" series={[{ key: "stars" }]} />
        <BarChart aria-label="Stars in k" data={data} index="month" series={[{ key: "stars" }]} valueFormat={(value) => `${value / 1000}k`} />
      </CenngeProvider>,
    );
    // Russian groups thousands with a no-break space (a narrow one in newer ICU).
    expect(screen.getByRole("table", { name: "Звёзды" })).toHaveTextContent(/1\s280/);
    expect(screen.getByRole("table", { name: "Stars in k" })).toHaveTextContent("1.28k");
  });

  it("one series has no legend: the chart's name says what it is", () => {
    const { container } = render(<BarChart aria-label="Stars" data={data} index="month" series={[{ key: "stars" }]} />);
    expect(container.querySelector('[data-slot="chart-legend"]')).toBeNull();
  });

  it("with no data, says so and offers nothing to focus", () => {
    const { container } = render(
      <BarChart aria-label="Releases" data={[] as { day: string; count: number }[]} index="day" series={[{ key: "count" }]} emptyContent="No releases yet" />,
    );
    expect(screen.getByText("No releases yet")).toBeInTheDocument();
    expect(container.querySelector("[tabindex]")).toBeNull();
  });

  it("missing values show as a dash in the table, never as zero", () => {
    render(<BarChart aria-label="Gaps" data={[{ day: "Mon", count: null }, { day: "Tue", count: 3 }]} index="day" series={[{ key: "count" }]} />);
    expect(screen.getByRole("row", { name: /Mon/ })).toHaveTextContent("Mon–");
  });
});

describe("DonutChart", () => {
  const languages = [
    { language: "TypeScript", bytes: 300 },
    { language: "Go", bytes: 0 },
    { language: "Rust", bytes: 100 },
  ];

  it("is whole on the server: the ring, the total, the legend and the table", () => {
    const html = renderToString(<DonutChart aria-label="Languages" data={languages} index="language" value="bytes" />);
    // Two parts in the ring: Go, at nought, is left out of it.
    expect(html.match(/<path /g)).toHaveLength(2);
    expect(html).toContain('data-slot="donut-value">400<');
    expect(html).toContain(">75%<");
    expect(html).toContain('<th scope="row">Total</th><td>400</td><td>100%</td>');
  });

  it("a single part is a whole ring, without a gap", () => {
    const html = renderToString(<DonutChart aria-label="One" data={[{ name: "all", n: 5 }]} index="name" value="n" />);
    // Two circles, the hole cut out by the even-odd rule.
    expect(html.match(/<path [^>]*d="([^"]+)"/)?.[1]?.match(/M/g)).toHaveLength(2);
  });
});

describe("Sparkline", () => {
  it("is a named picture, drawn whole on the server", () => {
    const html = renderToString(<Sparkline aria-label="Downloads, up" data={[1, 3, 2, 5]} />);
    expect(html).toContain('role="img" aria-label="Downloads, up"');
    // The latest value is the highest: its dot sits at the right edge, at the top of the line's room.
    expect(html).toContain('style="left:100%;top:10%');
  });

  it("breaks at a missing value, shows a value alone as a dot, and runs a flat trend through the middle", () => {
    const { container, rerender } = render(<Sparkline aria-label="Gaps" data={[1, 2, null, 4, null, 2, 3]} showLast={false} />);
    expect(container.querySelectorAll("path")).toHaveLength(2);
    // 4 stands alone between gaps.
    expect(container.querySelectorAll("span > span")).toHaveLength(1);
    rerender(<Sparkline aria-label="Flat" data={[7, 7, 7]} />);
    expect(container.querySelector("path")).toHaveAttribute("d", "M0,50L50,50L100,50");
  });

  it("an area variant adds the wash under the line", () => {
    const { container } = render(<Sparkline aria-label="Area" data={[1, 2, 3]} variant="area" />);
    expect(container.querySelectorAll("path")).toHaveLength(2);
    expect(container.querySelector("linearGradient")).not.toBeNull();
  });
});

describe("references", () => {
  const week = [
    { day: "Mon", commits: 3 },
    { day: "Tue", commits: 4 },
  ];

  it("the value axis reaches a goal above the data; the goal and a band are drawn and read out", () => {
    const html = renderToString(
      <BarChart
        aria-label="Commits"
        data={week}
        index="day"
        series={[{ key: "commits" }]}
        references={[{ value: 10, label: "Goal" }, { from: 2, to: 5, label: "Usual", color: "success" }]}
      />,
    );
    // Without the goal the axis would end at 4.
    expect(html).toContain(">10<");
    expect(html).toContain('data-slot="chart-reference-line"');
    expect(html).toContain('data-slot="chart-reference-band"');
    expect(html).toContain("<li>Goal: 10</li>");
    expect(html).toContain("<li>Usual: 2 to 5</li>");
  });

  it("a label is optional: the screen reader text names it generically", () => {
    render(<BarChart aria-label="Commits" data={week} index="day" series={[{ key: "commits" }]} references={[{ value: 5 }]} />);
    expect(screen.getByText("Goal: 5")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Goals and ranges" })).toBeInTheDocument();
    expect(document.querySelector('[data-slot="chart-reference-label"]')).toBeNull();
  });
});

describe("references against a fixed domain", () => {
  it("a line outside the domain is not drawn but still read; a band is cut at its edge; a label flips inside near the top", () => {
    const html = renderToString(
      <BarChart
        aria-label="Steps"
        data={[{ day: "Mon", steps: 9000 }]}
        index="day"
        series={[{ key: "steps" }]}
        domain={[0, 10000]}
        references={[{ value: 12000, label: "Stretch" }, { value: 10000, label: "Goal" }, { from: 8000, to: 15000, label: "Active" }]}
      />,
    );
    expect(html.match(/data-slot="chart-reference-line"/g)).toHaveLength(1);
    expect(html).toContain("<li>Stretch: 12,000</li>");
    expect(html).toContain('height="20%"');
    // The goal is the top of the axis: its label sits under the line, inside the plot.
    expect(html).toMatch(/top:0%;transform:translateY\(2px\)">Goal</);
  });

  it("a series drawn as dots is keyed by a dot in the legend", () => {
    const { container } = render(
      <LineChart
        aria-label="Weight"
        data={[
          { d: "1", kg: 80, avg: 80 },
          { d: "2", kg: 81, avg: 80.5 },
        ]}
        index="d"
        series={[{ key: "kg", display: "dots" }, { key: "avg" }]}
      />,
    );
    expect(container.querySelector('[data-slot="chart-legend"] li span')).toHaveClass("rounded-full", "size-1.5");
  });
});

describe("movingAverage", () => {
  it("averages each value with the ones before it in the window, skipping missing ones", () => {
    expect(movingAverage([2, 4, 6, 8], 2)).toEqual([2, 3, 5, 7]);
    expect(movingAverage([2, null, 6, null, null], 2)).toEqual([2, 2, 6, 6, null]);
    expect(movingAverage([1, 2, 3], 0)).toEqual([1, 2, 3]);
    expect(movingAverage([1, 2, 3], Number.NaN)).toEqual([1, 2, 3]);
  });
});
