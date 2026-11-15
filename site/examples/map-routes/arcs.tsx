"use client";

import { Map, MapArc, MapMarker, type LngLat } from "cennge-ui/map";

const manhattan: LngLat = [-73.9855, 40.758];
const offices: { name: string; lngLat: LngLat }[] = [
  { name: "Bronx office", lngLat: [-73.8977, 40.8622] },
  { name: "Queens office", lngLat: [-73.8331, 40.7675] },
  { name: "Brooklyn office", lngLat: [-73.9888, 40.7033] },
];

export default function Shipments() {
  return (
    <Map
      aria-label="Shipments from the Manhattan office"
      defaultBounds={[
        [-74.0, 40.7],
        [-73.83, 40.862],
      ]}
      scrollZoom={false}
      className="h-80"
    >
      {/* Each curve bows to the left of its way: out and back are two curves, not one. */}
      <MapArc arcs={offices.map((office) => ({ from: manhattan, to: office.lngLat }))} width={3} />
      <MapArc arcs={offices.map((office) => ({ from: office.lngLat, to: manhattan }))} color="secondary" dashed />
      <MapMarker lngLat={manhattan} label="Manhattan office" tooltip="Manhattan office" />
      {offices.map((office) => (
        <MapMarker key={office.name} lngLat={office.lngLat} label={office.name} tooltip={office.name} color="default" size="sm" />
      ))}
    </Map>
  );
}
