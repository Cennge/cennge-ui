"use client";

import { useState } from "react";
import { Badge, Button } from "cennge-ui";
import { Map, MapControls, MapMarker, type LngLat } from "cennge-ui/map";

const offices: { name: string; area: string; lngLat: LngLat; repositories: string[] }[] = [
  { name: "Manhattan office", area: "Midtown", lngLat: [-73.9855, 40.758], repositories: ["cennge-ui", "payload-cache"] },
  { name: "Brooklyn office", area: "Dumbo", lngLat: [-73.9888, 40.7033], repositories: ["spredo-crypto-screener"] },
  { name: "Queens office", area: "Flushing", lngLat: [-73.8331, 40.7675], repositories: ["ai-niche-scout"] },
  { name: "Bronx office", area: "Fordham", lngLat: [-73.8977, 40.8622], repositories: ["playwright-msi-scraper"] },
];

const osm = ([lng, lat]: LngLat) => `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;

export default function MarkersPlate() {
  // One popup at a time; the Bronx office's is open at first.
  const [open, setOpen] = useState<string | null>("Bronx office");

  return (
    <Map
      aria-label="Offices"
      defaultBounds={[
        [-74.0, 40.69],
        [-73.83, 40.87],
      ]}
      // Room at the top for the open popup, clear of the buttons on the right.
      boundsPadding={{ top: 176, right: 88, bottom: 32, left: 24 }}
      scrollZoom={false}
      className="h-[26rem]"
    >
      <MapControls showCompass={false} />
      {offices.map((office) => (
        <MapMarker
          key={office.name}
          lngLat={office.lngLat}
          label={office.name}
          tooltip={office.area}
          isPopupOpen={open === office.name}
          onPopupOpenChange={(isOpen) => setOpen(isOpen ? office.name : null)}
          popup={
            <div className="flex flex-col gap-2.5">
              <div>
                <p className="font-semibold">{office.name}</p>
                <p className="text-muted">{office.area}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {office.repositories.map((repository) => (
                  <Badge key={repository} size="sm">
                    {repository}
                  </Badge>
                ))}
              </div>
              <Button asChild size="sm" variant="flat" color="primary" className="self-start">
                <a href={osm(office.lngLat)}>Open in OpenStreetMap</a>
              </Button>
            </div>
          }
        />
      ))}
    </Map>
  );
}
