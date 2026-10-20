import { renderToString } from "react-dom/server";
import { render, screen } from "@testing-library/react";
import { parseCredit } from "./attribution";
import { Map, MapMarker } from "./index";

describe("Map", () => {
  it("on the server: a labelled region holding its place, nothing of MapLibre yet", () => {
    const html = renderToString(
      <Map aria-label="Offices" className="h-64">
        <MapMarker lngLat={[37.62, 55.75]} label="Moscow" />
      </Map>,
    );
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Offices"');
    expect(html).toContain('data-state="loading"');
    expect(html).toContain("h-64");
    // Children need the map: they render once it exists, in the browser.
    expect(html).not.toContain("Moscow");
    expect(html).not.toContain("<canvas");
  });

  it("says so when the map cannot be drawn (here jsdom has no WebGL), in the page's language", async () => {
    render(<Map aria-label="Offices" labels={{ loadError: "Карта не загрузилась" }} />);
    expect(await screen.findByRole("alert", {}, { timeout: 10_000 })).toHaveTextContent("Карта не загрузилась");
    expect(screen.getByRole("region", { name: "Offices" })).toHaveAttribute("data-state", "error");
  });
});

describe("attribution", () => {
  it("keeps text and http(s) links of a source's credit, and nothing else", () => {
    expect(parseCredit('<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> © OpenMapTiles')).toEqual([
      { text: "OpenFreeMap", href: "https://openfreemap.org" },
      { text: " © OpenMapTiles" },
    ]);
    // Markup, scripts and other kinds of link are left as text, or dropped.
    expect(
      parseCredit('<img src=x onerror="alert(1)"><script>alert(2)</script><a href="javascript:alert(3)">Data</a> <b>bold</b>'),
    ).toEqual([{ text: "Data" }, { text: " " }, { text: "bold" }]);
  });
});
