"use client";

import { useState } from "react";
import { Map, MapMarker, type LngLat } from "cennge-ui/map";

const offices: { name: string; area: string; lngLat: LngLat; repositories: string }[] = [
  { name: "Manhattan office", area: "Midtown", lngLat: [-73.9855, 40.758], repositories: "cennge-ui, payload-cache" },
  { name: "Brooklyn office", area: "Dumbo", lngLat: [-73.9888, 40.7033], repositories: "spredo-crypto-screener" },
  { name: "Queens office", area: "Flushing", lngLat: [-73.8331, 40.7675], repositories: "ai-niche-scout" },
  { name: "Bronx office", area: "Fordham", lngLat: [-73.8977, 40.8622], repositories: "playwright-msi-scraper" },
];

export default function OfficeFinder() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    // Side by side where there is room, the list above the map where there is not.
    <div className="@container w-full">
      <div className="grid gap-4 @xl:grid-cols-[12rem_minmax(0,1fr)]">
        <ul aria-label="Office list" className="flex flex-wrap gap-1 @xl:flex-col">
          {offices.map((office) => (
            <li key={office.name}>
              <button
                type="button"
                aria-pressed={open === office.name}
                onClick={() => setOpen(open === office.name ? null : office.name)}
                className="w-full cursor-pointer rounded-medium px-3 py-2 text-left transition-colors hover:bg-surface-3 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-solid aria-pressed:bg-primary-bg"
              >
                <span className="block text-sm font-semibold">{office.name}</span>
                <span className="block text-sm text-muted">{office.area}</span>
              </button>
            </li>
          ))}
        </ul>
        <Map
          aria-label="Office map"
          defaultBounds={[
            [-74.0, 40.69],
            [-73.83, 40.87],
          ]}
          scrollZoom={false}
          className="h-96"
        >
          {offices.map((office) => (
            <MapMarker
              key={office.name}
              lngLat={office.lngLat}
              label={office.name}
              tooltip={office.area}
              isPopupOpen={open === office.name}
              onPopupOpenChange={(isOpen) => setOpen(isOpen ? office.name : null)}
              popup={
                <>
                  <p className="font-semibold">{office.name}</p>
                  <p className="text-muted">{office.repositories}</p>
                </>
              }
            />
          ))}
        </Map>
      </div>
    </div>
  );
}
