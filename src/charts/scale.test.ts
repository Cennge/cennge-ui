import { arcPath, areaPath, barPath, linePath, runs } from "./path";
import { niceStep, stack, valueScale } from "./scale";

describe("valueScale", () => {
  it("rounds the ends to steps of 1, 2, 2.5 or 5 and includes zero", () => {
    expect(valueScale([12, 87])).toMatchObject({ min: 0, max: 100, ticks: [0, 20, 40, 60, 80, 100] });
    expect(valueScale([1234, 4100])).toMatchObject({ min: 0, max: 5000, ticks: [0, 1000, 2000, 3000, 4000, 5000] });
    expect(valueScale([0, 100])).toMatchObject({ max: 100, ticks: [0, 25, 50, 75, 100] });
    expect(niceStep(7, 4)).toBe(2);
  });

  it("goes below zero for negative values, and around the data when zero is not wanted", () => {
    expect(valueScale([-30, 70])).toMatchObject({ min: -50, max: 75, ticks: [-50, -25, 0, 25, 50, 75] });
    expect(valueScale([96, 104], { includeZero: false })).toMatchObject({ min: 96, max: 104 });
  });

  it("keeps decimal ticks exact", () => {
    expect(valueScale([0.1, 0.3]).ticks).toEqual([0, 0.1, 0.2, 0.3]);
  });

  it("copes with no data, one value and equal values", () => {
    expect(valueScale([])).toMatchObject({ min: 0, max: 1 });
    expect(valueScale([0, 0])).toMatchObject({ min: 0, max: 1 });
    expect(valueScale([5, 5]).max).toBeGreaterThanOrEqual(5);
    expect(valueScale([Number.NaN, 4])).toMatchObject({ min: 0, max: 4 });
  });

  it("takes a fixed domain as it is", () => {
    const scale = valueScale([1, 2], { domain: [0, 130] });
    expect(scale).toMatchObject({ min: 0, max: 130 });
    expect(scale.ratio(65)).toBe(0.5);
  });
});

describe("stack", () => {
  it("piles positive values up and negative ones down, each from zero", () => {
    expect(
      stack([
        [3, -2, null],
        [4, 5, 1],
      ]),
    ).toEqual([
      [
        [0, 3],
        [0, -2],
        [0, 0],
      ],
      [
        [3, 7],
        [0, 5],
        [0, 1],
      ],
    ]);
  });
});

describe("paths", () => {
  it("breaks a line at a missing value", () => {
    expect(runs([true, true, false, true])).toEqual([[0, 1], [3]]);
    expect(runs([false, false])).toEqual([]);
  });

  it("draws straight lines, and smooth ones that stay flat between equal values", () => {
    expect(linePath([[0, 10], [10, 0], [20, 5]])).toBe("M0,10L10,0L20,5");
    // A peak at the middle point: its tangent is flat, so the curve cannot overshoot it.
    const smooth = linePath([[0, 10], [10, 0], [20, 10]], "smooth");
    expect(smooth.startsWith("M0,10C")).toBe(true);
    expect(smooth).toContain(",6.67,0,10,0C13.33,0,");
  });

  it("closes an area along its floor, traced back", () => {
    expect(areaPath([[0, 2], [10, 1]], [[0, 5], [10, 5]])).toBe("M0,2L10,1L10,5L0,5Z");
  });

  it("rounds a bar at its data end only", () => {
    expect(barPath(0, 0, 20, 50, 4, "top")).toBe("M0,50V4A4,4,0,0,1,4,0H16A4,4,0,0,1,20,4V50Z");
    // A bar shorter than the radius is rounded as much as it is tall.
    expect(barPath(0, 0, 20, 2, 4, "top")).toContain("A2,2");
    expect(barPath(0, 0, 20, 0, 4, "top")).toBe("M0,0H20V0H0Z");
  });

  it("draws ring segments and full rings", () => {
    const quarter = arcPath(50, 50, 40, 20, 0, Math.PI / 2);
    expect(quarter.startsWith("M50,10A40,40,0,0,1,90,50L70,50A20,20,0,0,0,50,30Z")).toBe(true);
    // A full ring is two circles, the hole cut out.
    expect(arcPath(50, 50, 40, 20, 0, Math.PI * 2).match(/M/g)).toHaveLength(2);
  });
});
