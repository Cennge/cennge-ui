"use client";

import { Card, CardBody } from "cennge-ui";
import { Map, MapMarker, type LngLat } from "cennge-ui/map";

const offices: { name: string; area: string; lngLat: LngLat }[] = [
  { name: "Manhattan office", area: "Midtown, Manhattan", lngLat: [-73.9855, 40.758] },
  { name: "Brooklyn office", area: "Dumbo, Brooklyn", lngLat: [-73.9888, 40.7033] },
];

export default function OfficeCards() {
  return (
    <div className="@container w-full">
      <div className="grid gap-4 @lg:grid-cols-2">
        {offices.map((office) => (
          <Card key={office.name}>
            <Map
              aria-label={`Map of ${office.area}`}
              isInteractive={false}
              defaultCenter={office.lngLat}
              defaultZoom={14.5}
              className="h-40 rounded-none border-0"
            >
              <MapMarker lngLat={office.lngLat} label={office.name} />
            </Map>
            <CardBody>
              <p className="font-semibold">{office.name}</p>
              <p className="text-sm text-muted">{office.area}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
