import { renderToString } from "react-dom/server";
import { render, screen } from "@testing-library/react";
import { CenngeProvider } from "../provider";
import { BarChart } from "./bar-chart";
import { chartColor } from "./colors";

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
