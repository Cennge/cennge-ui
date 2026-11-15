"use client";

import { useRef } from "react";
import { Button } from "cennge-ui";
import { Map, MapControls, type LngLat, type MapLibreMap } from "cennge-ui/map";

const boroughs: { name: string; center: LngLat; zoom: number }[] = [
  { name: "Manhattan", center: [-73.9712, 40.7831], zoom: 11.4 },
  { name: "Brooklyn", center: [-73.9442, 40.6782], zoom: 11.2 },
  { name: "Queens", center: [-73.7949, 40.7282], zoom: 10.8 },
  { name: "The Bronx", center: [-73.8648, 40.8448], zoom: 11.4 },
  { name: "Staten Island", center: [-74.1502, 40.5795], zoom: 11.2 },
];

export default function BoroughMap() {
  const mapRef = useRef<MapLibreMap | null>(null);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {boroughs.map((borough) => (
          <Button
            key={borough.name}
            size="sm"
            variant="flat"
            // MapLibre jumps instead of flying when the reader asks for reduced motion.
            onClick={() => mapRef.current?.flyTo({ center: borough.center, zoom: borough.zoom })}
          >
            {borough.name}
          </Button>
        ))}
      </div>
      <Map
        aria-label="New York boroughs"
        mapRef={mapRef}
        defaultCenter={[-73.94, 40.7]}
        defaultZoom={9.6}
        scrollZoom={false}
        className="h-80"
      >
        <MapControls />
      </Map>
    </div>
  );
}
