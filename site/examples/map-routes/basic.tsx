"use client";

import { Map, MapMarker, MapRoute, type LngLat } from "cennge-ui/map";

const stops: { name: string; lngLat: LngLat }[] = [
  { name: "Manhattan office", lngLat: [-73.9855, 40.758] },
  { name: "Bronx office", lngLat: [-73.8977, 40.8622] },
  { name: "Queens office", lngLat: [-73.8331, 40.7675] },
  { name: "Brooklyn office", lngLat: [-73.9888, 40.7033] },
];

// The van's way between the stops, along the main roads, roughly.
const route: LngLat[] = [
  [-73.9855, 40.758],
  [-73.944, 40.804],
  [-73.93, 40.835],
  [-73.8977, 40.8622],
  [-73.825, 40.8],
  [-73.8331, 40.7675],
  [-73.87, 40.73],
  [-73.93, 40.71],
  [-73.9888, 40.7033],
];

export default function VanRoute() {
  return (
    <Map
      aria-label="Van route: Manhattan, the Bronx, Queens, Brooklyn"
      defaultBounds={[
        [-73.99, 40.7],
        [-73.825, 40.862],
      ]}
      scrollZoom={false}
      className="h-80"
    >
      <MapRoute coordinates={route} />
      {stops.map((stop) => (
        <MapMarker key={stop.name} lngLat={stop.lngLat} label={stop.name} tooltip={stop.name} color="default" size="sm" />
      ))}
    </Map>
  );
}
