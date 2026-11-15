"use client";

import { Map, MapControls } from "cennge-ui/map";

export default function ManhattanMap() {
  return (
    <Map
      aria-label="Manhattan"
      // South-west and north-east corners: the Battery to Inwood.
      defaultBounds={[
        [-74.02, 40.7],
        [-73.91, 40.875],
      ]}
      // More room on the right, where the buttons are.
      boundsPadding={{ top: 24, right: 64, bottom: 24, left: 24 }}
      scrollZoom={false}
      className="h-96"
    >
      <MapControls />
    </Map>
  );
}
