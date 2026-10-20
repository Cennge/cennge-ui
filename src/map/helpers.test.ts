import type { StyleSpecification } from "maplibre-gl";
import { arcPoints } from "./arc";
import { dataDomain } from "./geojson";
import { readPalette, tintStyle } from "./palette";

describe("arcPoints", () => {
  it("runs from one end to the other, bowed to the left by a tenth of the length per 0.2 of curvature", () => {
    const points = arcPoints([10, 40], [20, 40], 0.2);
    expect(points[0]).toEqual([10, 40]);
    expect(points.at(-1)).toEqual([20, 40]);
    // The middle of a quadratic curve is halfway to its control point: 0.2 × 10° off, halved.
    const middle = points[points.length >> 1]!;
    expect(middle[0]).toBeCloseTo(15);
    expect(middle[1]).toBeCloseTo(41);
    expect(arcPoints([10, 40], [20, 40], -0.2)[points.length >> 1]![1]).toBeCloseTo(39);
  });

  it("takes the short way across the 180th meridian", () => {
    const points = arcPoints([170, 0], [-170, 0], 0);
    expect(points.at(-1)![0]).toBeCloseTo(190);
    expect(Math.max(...points.map(([lng]) => lng))).toBeLessThanOrEqual(190);
    expect(Math.min(...points.map(([lng]) => lng))).toBeGreaterThanOrEqual(170);
  });
});

describe("dataDomain", () => {
  it("is the lowest and highest number of the property, skipping what is not a number", () => {
    const data = {
      type: "FeatureCollection" as const,
      features: [3, 12, "n/a", 7, null].map((value) => ({
        type: "Feature" as const,
        properties: { orders: value },
        geometry: { type: "Point" as const, coordinates: [0, 0] },
      })),
    };
    expect(dataDomain(data, "orders")).toEqual([3, 12]);
    expect(dataDomain(data, "missing")).toEqual([0, 1]);
    // A URL: nothing to read yet.
    expect(dataDomain("https://example.com/data.geojson", "orders")).toEqual([0, 1]);
  });
});

describe("the base map's palette", () => {
  const base: StyleSpecification = {
    version: 8,
    sources: {},
    layers: [
      { id: "background", type: "background", paint: { "background-color": "#fff" } },
      { id: "water", type: "fill", source: "x", "source-layer": "water", paint: { "fill-color": "#ccc" } },
      { id: "park", type: "fill", source: "x", "source-layer": "park", paint: { "fill-color": "#ddd", "fill-opacity": 0.5 } },
      { id: "highway_major_casing", type: "line", source: "x", "source-layer": "t", paint: { "line-color": "#aaa", "line-width": 3 } },
      { id: "highway_minor", type: "line", source: "x", "source-layer": "t", paint: { "line-color": "#eee" } },
      { id: "boundary_2", type: "line", source: "x", "source-layer": "b", paint: { "line-color": "#999" } },
      { id: "label_city", type: "symbol", source: "x", "source-layer": "p", layout: { "text-field": "{name}" }, paint: { "text-color": "#000" } },
      { id: "road_shield", type: "symbol", source: "x", "source-layer": "p", layout: { "icon-image": "shield" } },
    ],
  };

  it("comes from the theme's tokens", () => {
    const node = document.createElement("div");
    node.style.setProperty("--cennge-surface-2", "#181b20");
    node.style.setProperty("--cennge-info", "#2563eb");
    document.body.append(node);
    const palette = readPalette(node, "dark");
    expect(palette.land).toBe("rgb(24, 27, 32)");
    // Water: the darkest surface with a fifth of info in it.
    expect(palette.water).toMatch(/^rgb\(/);
    expect(palette.water).not.toBe(palette.land);
    node.remove();
  });

  it("replaces each layer's colour by what it draws, and keeps everything else", () => {
    const palette = readPalette(document.body, "dark");
    const tinted = tintStyle(base, palette);
    const paint = (id: string) => tinted.layers.find((layer) => layer.id === id)!.paint as Record<string, unknown>;
    expect(paint("background")["background-color"]).toBe(palette.land);
    expect(paint("water")["fill-color"]).toBe(palette.water);
    expect(paint("park")).toEqual({ "fill-color": palette.park, "fill-opacity": 0.5 });
    expect(paint("highway_major_casing")).toEqual({ "line-color": palette.roadCasing, "line-width": 3 });
    expect(paint("highway_minor")["line-color"]).toBe(palette.roadMinor);
    expect(paint("boundary_2")["line-color"]).toBe(palette.boundary);
    expect(paint("label_city")).toEqual({ "text-color": palette.strongLabel, "text-halo-color": palette.halo });
    // An icon without text has no text colours to set.
    expect(paint("road_shield")).toEqual({});
    // The original is untouched.
    expect((base.layers[1]!.paint as Record<string, unknown>)["fill-color"]).toBe("#ccc");
  });
});
