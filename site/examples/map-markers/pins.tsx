"use client";

import { Map, MapMarker, type LngLat } from "cennge-ui/map";

const offices: { area: string; borough: string; lngLat: LngLat }[] = [
  { area: "Midtown", borough: "Manhattan", lngLat: [-73.9855, 40.758] },
  { area: "Dumbo", borough: "Brooklyn", lngLat: [-73.9888, 40.7033] },
  { area: "Flushing", borough: "Queens", lngLat: [-73.8331, 40.7675] },
];

function Pin({ children }: { children: string }) {
  return (
    <span className="flex flex-col items-center">
      <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-raised">
        {children}
      </span>
      {/* The tip, on the point: the marker is anchored at its bottom. */}
      <span className="-mt-px h-1.5 w-3 bg-primary [clip-path:polygon(0_0,100%_0,50%_100%)]" />
    </span>
  );
}

export default function OfficePins() {
  return (
    <Map
      aria-label="Offices by neighbourhood"
      defaultBounds={[
        [-74.0, 40.69],
        [-73.82, 40.77],
      ]}
      scrollZoom={false}
      className="h-80"
    >
      {offices.map((office) => (
        <MapMarker
          key={office.area}
          lngLat={office.lngLat}
          // Starts with the text the pin shows, so it can be said to pick it.
          label={`${office.area}, ${office.borough}`}
          anchor="bottom"
          popup={
            <>
              <p className="font-semibold">{office.area} office</p>
              <p className="text-muted">{office.borough}</p>
            </>
          }
        >
          <Pin>{office.area}</Pin>
        </MapMarker>
      ))}
    </Map>
  );
}
