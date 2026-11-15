"use client";

import { Map, MapMarker, type LngLat } from "cennge-ui/map";

const dumbo: LngLat = [-73.9888, 40.7033];

export default function OfficeMarker() {
  return (
    <Map aria-label="Brooklyn office" defaultCenter={dumbo} defaultZoom={13.5} scrollZoom={false} className="h-72">
      <MapMarker
        lngLat={dumbo}
        label="Brooklyn office"
        tooltip="Dumbo"
        popup={
          <>
            <p className="font-semibold">Brooklyn office</p>
            <p className="text-muted">Dumbo, Brooklyn</p>
          </>
        }
      />
    </Map>
  );
}
