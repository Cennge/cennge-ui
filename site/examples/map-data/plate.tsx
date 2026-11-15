"use client";

import { useMemo, useState } from "react";
import { ToggleGroup, ToggleGroupItem, type CenngeColor } from "cennge-ui";
import { Map, MapControls, MapGeoJSON, MapLegend, type LngLat } from "cennge-ui/map";

/** Hexagons around Manhattan, with a day's deliveries and the share that came late. */
function hexagons() {
  const center: LngLat = [-73.95, 40.735];
  const size = 0.008; // degrees of latitude
  const stretch = 1 / Math.cos((center[1] * Math.PI) / 180);
  const features = [];
  for (let q = -6; q <= 6; q++) {
    for (let r = -6; r <= 6; r++) {
      if (Math.abs(q + r) > 6) continue;
      const x = center[0] + size * 1.5 * q * stretch;
      const y = center[1] + size * Math.sqrt(3) * (r + q / 2);
      const distance = Math.hypot(q, r, q + r) / 2;
      const ring = Array.from({ length: 7 }, (_, corner) => {
        const angle = (Math.PI / 3) * (corner % 6);
        return [x + size * Math.cos(angle) * stretch, y + size * Math.sin(angle)];
      });
      features.push({
        type: "Feature" as const,
        properties: {
          deliveries: Math.round(Math.max(0, 125 - distance * 17 + Math.sin(q * 1.7 + r) * 12)),
          late: Math.round(Math.max(0, 3 + distance * 2 + Math.cos(q * 0.9 - r * 1.3) * 4)),
        },
        geometry: { type: "Polygon" as const, coordinates: [ring] },
      });
    }
  }
  return { type: "FeatureCollection" as const, features };
}

const measures: Record<string, { title: string; property: string; color: CenngeColor; domain: [number, number]; unit: string }> = {
  deliveries: { title: "Deliveries a day", property: "deliveries", color: "primary", domain: [0, 130], unit: "" },
  late: { title: "Delivered late", property: "late", color: "warning", domain: [0, 20], unit: "%" },
};

export default function DataPlate() {
  const cells = useMemo(hexagons, []);
  const [name, setName] = useState("deliveries");
  const measure = measures[name]!;

  return (
    <div className="flex w-full flex-col gap-3">
      <ToggleGroup aria-label="Measure" size="sm" value={name} onValueChange={(next) => next && setName(next)} className="self-start">
        <ToggleGroupItem value="deliveries">Deliveries</ToggleGroupItem>
        <ToggleGroupItem value="late">Late</ToggleGroupItem>
      </ToggleGroup>
      <Map
        aria-label={`${measure.title} by area`}
        defaultBounds={[
          [-74.056, 40.645],
          [-73.844, 40.825],
        ]}
        // Room for the legend below the hexagons and the buttons beside them.
        boundsPadding={{ top: 16, right: 56, bottom: 104, left: 16 }}
        scrollZoom={false}
        className="h-96"
      >
        <MapGeoJSON
          data={cells}
          valueProperty={measure.property}
          color={measure.color}
          domain={measure.domain}
          tooltip={(cell) => `${String(cell.deliveries)} deliveries a day, ${String(cell.late)}% late`}
        />
        <MapLegend title={measure.title} color={measure.color} domain={measure.domain} format={(value) => `${value}${measure.unit}`} />
        <MapControls showCompass={false} />
      </Map>
    </div>
  );
}
