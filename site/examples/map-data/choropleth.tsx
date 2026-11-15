"use client";

import { useMemo, useState } from "react";
import { Map, MapGeoJSON, MapLegend, type LngLat } from "cennge-ui/map";

/** Hexagons around Midtown, each with the deliveries it gets in a day. */
function hexagons() {
  const center: LngLat = [-73.975, 40.755];
  const size = 0.0045; // degrees of latitude
  const stretch = 1 / Math.cos((center[1] * Math.PI) / 180);
  const features = [];
  for (let q = -5; q <= 5; q++) {
    for (let r = -5; r <= 5; r++) {
      if (Math.abs(q + r) > 5) continue;
      const x = center[0] + size * 1.5 * q * stretch;
      const y = center[1] + size * Math.sqrt(3) * (r + q / 2);
      const ring = Array.from({ length: 7 }, (_, corner) => {
        const angle = (Math.PI / 3) * (corner % 6);
        return [x + size * Math.cos(angle) * stretch, y + size * Math.sin(angle)];
      });
      const deliveries = Math.round(Math.max(0, 90 - Math.hypot(q, r, q + r) * 12 + Math.sin(q * 1.3 - r) * 10));
      features.push({
        type: "Feature" as const,
        properties: { deliveries },
        geometry: { type: "Polygon" as const, coordinates: [ring] },
      });
    }
  }
  return { type: "FeatureCollection" as const, features };
}

export default function DeliveriesMap() {
  const cells = useMemo(hexagons, []);
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div className="flex w-full flex-col gap-3">
      <Map
        aria-label="Deliveries a day around Midtown"
        defaultBounds={[
          [-74.026, 40.712],
          [-73.924, 40.798],
        ]}
        // Room for the legend below the hexagons.
        boundsPadding={{ top: 16, right: 16, bottom: 104, left: 16 }}
        scrollZoom={false}
        className="h-96"
      >
        <MapGeoJSON
          data={cells}
          valueProperty="deliveries"
          domain={[0, 90]}
          tooltip={(cell) => `${String(cell.deliveries)} deliveries a day`}
          onFeatureClick={(cell) => setPicked(Number(cell.deliveries))}
        />
        <MapLegend title="Deliveries a day" domain={[0, 90]} />
      </Map>
      <p className="text-sm text-muted">
        {picked === null ? "Click an area to pick it." : `Picked an area with ${picked} deliveries a day.`}
      </p>
    </div>
  );
}
