"use client";

import { useState } from "react";
import { Snippet } from "cennge-ui";
import { Map, MapControls, type MapView } from "cennge-ui/map";

const start: MapView = { center: [-73.97, 40.74], zoom: 10.5, bearing: 0, pitch: 0 };

/** The props that open a map on this view. */
function propsOf({ center: [lng, lat], zoom, bearing, pitch }: MapView) {
  const lines = [`defaultCenter={[${lng.toFixed(4)}, ${lat.toFixed(4)}]}`, `defaultZoom={${zoom.toFixed(1)}}`];
  if (Math.round(bearing) !== 0) lines.push(`defaultBearing={${Math.round(bearing)}}`);
  if (Math.round(pitch) !== 0) lines.push(`defaultPitch={${Math.round(pitch)}}`);
  return lines.join("\n");
}

export default function MapPlate() {
  const [view, setView] = useState(start);
  return (
    <div className="flex w-full flex-col gap-3">
      <Map
        aria-label="New York"
        defaultCenter={start.center}
        defaultZoom={start.zoom}
        scrollZoom={false}
        onViewChange={setView}
        className="h-96"
      >
        <MapControls showLocate showFullscreen />
      </Map>
      <Snippet symbol={false} size="sm" copyLabel="Copy the props of this view" className="w-full">
        {propsOf(view)}
      </Snippet>
    </div>
  );
}
