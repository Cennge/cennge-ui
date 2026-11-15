"use client";

import { useState } from "react";
import { Switch } from "cennge-ui";
import { Map, MapControls } from "cennge-ui/map";

export default function ScrollZoomMap() {
  const [scrollZoom, setScrollZoom] = useState(false);

  return (
    <div className="flex w-full flex-col gap-4">
      <Map aria-label="Brooklyn" defaultCenter={[-73.95, 40.66]} defaultZoom={11.5} scrollZoom={scrollZoom} className="h-72">
        <MapControls />
      </Map>
      <Switch isSelected={scrollZoom} onValueChange={setScrollZoom}>
        Zoom with the mouse wheel
      </Switch>
    </div>
  );
}
