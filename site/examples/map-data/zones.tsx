"use client";

import { useState } from "react";
import { Map, MapGeoJSON } from "cennge-ui/map";

// Areas, a line and points in one collection: each is drawn as what it is.
const network = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      properties: { name: "Zone A: Lower Manhattan" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[[-74.016, 40.703], [-74.012, 40.727], [-73.985, 40.73], [-73.973, 40.714], [-74.0, 40.701], [-74.016, 40.703]]],
      },
    },
    {
      type: "Feature" as const,
      properties: { name: "Zone B: Downtown Brooklyn" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[[-73.998, 40.702], [-73.972, 40.704], [-73.97, 40.684], [-73.996, 40.683], [-73.998, 40.702]]],
      },
    },
    {
      type: "Feature" as const,
      properties: { name: "Shuttle between the depots" },
      geometry: { type: "LineString" as const, coordinates: [[-74.004, 40.718], [-73.992, 40.707], [-73.985, 40.694]] },
    },
    { type: "Feature" as const, properties: { name: "Depot: Tribeca" }, geometry: { type: "Point" as const, coordinates: [-74.004, 40.718] } },
    { type: "Feature" as const, properties: { name: "Depot: Downtown Brooklyn" }, geometry: { type: "Point" as const, coordinates: [-73.985, 40.694] } },
  ],
};

export default function DeliveryZones() {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <div className="flex w-full flex-col gap-3">
      <Map
        aria-label="Delivery zones and depots"
        defaultBounds={[
          [-74.016, 40.683],
          [-73.97, 40.73],
        ]}
        scrollZoom={false}
        className="h-80"
      >
        <MapGeoJSON
          data={network}
          color="secondary"
          fillOpacity={0.35}
          tooltip={(feature) => String(feature.name)}
          onFeatureClick={(feature) => setPicked(String(feature.name))}
        />
      </Map>
      <p className="text-sm text-muted">{picked ? `Picked ${picked}.` : "Click a zone, the shuttle or a depot."}</p>
    </div>
  );
}
