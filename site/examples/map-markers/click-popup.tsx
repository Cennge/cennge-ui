"use client";

import { useState } from "react";
import { Button } from "cennge-ui";
import { Map, MapMarker, MapPopup, type LngLat } from "cennge-ui/map";

const format = ([lng, lat]: LngLat) => `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

export default function DeliveryStops() {
  const [picked, setPicked] = useState<LngLat | null>(null);
  const [stops, setStops] = useState<LngLat[]>([]);

  function addStop(point: LngLat) {
    setStops([...stops, point]);
    setPicked(null);
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <Map
        aria-label="Delivery stops"
        defaultCenter={[-73.99, 40.735]}
        defaultZoom={12.5}
        scrollZoom={false}
        onMapClick={setPicked}
        className="h-80"
      >
        {stops.map((stop, index) => (
          <MapMarker key={format(stop)} lngLat={stop} label={`Stop ${index + 1}`}>
            <span className="grid size-6 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground shadow-raised">
              {index + 1}
            </span>
          </MapMarker>
        ))}
        {picked ? (
          <MapPopup lngLat={picked} isOpen onOpenChange={() => setPicked(null)} label="Picked point">
            <p className="text-muted">Picked point</p>
            <p className="mb-2.5 font-medium tabular-nums">{format(picked)}</p>
            <Button size="sm" color="secondary" onClick={() => addStop(picked)}>
              Add stop {stops.length + 1}
            </Button>
          </MapPopup>
        ) : null}
      </Map>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{stops.length === 0 ? "Click the map to pick a point." : stops.length === 1 ? "1 stop" : `${stops.length} stops`}</p>
        <Button size="sm" variant="light" isDisabled={!stops.length} onClick={() => setStops([])}>
          Clear
        </Button>
      </div>
    </div>
  );
}
