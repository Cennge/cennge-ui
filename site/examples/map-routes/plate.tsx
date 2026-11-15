"use client";

import { useState } from "react";
import { Switch } from "cennge-ui";
import { Map, MapMarker, MapRoute, type LngLat } from "cennge-ui/map";

const offices: { name: string; lngLat: LngLat }[] = [
  { name: "Manhattan office", lngLat: [-73.9855, 40.758] },
  { name: "Bronx office", lngLat: [-73.8977, 40.8622] },
  { name: "Queens office", lngLat: [-73.8331, 40.7675] },
  { name: "Brooklyn office", lngLat: [-73.9888, 40.7033] },
];

// Midtown, the Bronx, Flushing, Dumbo: along the main roads, roughly.
const vanRoute: LngLat[] = [
  [-73.9855, 40.758],
  [-73.944, 40.804],
  [-73.93, 40.835],
  [-73.8977, 40.8622],
  [-73.825, 40.8],
  [-73.8331, 40.7675],
  [-73.87, 40.73],
  [-73.93, 40.71],
  [-73.9888, 40.7033],
];

// Flushing to JFK, down the Van Wyck.
const airportRoute: LngLat[] = [
  [-73.8331, 40.7675],
  [-73.8306, 40.7142],
  [-73.8158, 40.69],
  [-73.7781, 40.6413],
];

export default function RoutesPlate() {
  const [showVan, setShowVan] = useState(true);
  const [showAirport, setShowAirport] = useState(true);

  return (
    <div className="flex w-full flex-col gap-4">
      <Map
        aria-label="Van routes"
        defaultBounds={[
          [-73.99, 40.64],
          [-73.78, 40.86],
        ]}
        boundsPadding={32}
        scrollZoom={false}
        className="h-96"
      >
        {showVan ? <MapRoute coordinates={vanRoute} /> : null}
        {showAirport ? <MapRoute coordinates={airportRoute} color="secondary" width={3} dashed /> : null}
        {offices.map((office) => (
          <MapMarker key={office.name} lngLat={office.lngLat} label={office.name} tooltip={office.name} size="sm" color="default" />
        ))}
      </Map>
      <div className="flex flex-col gap-2.5">
        <Switch size="sm" isSelected={showVan} onValueChange={setShowVan}>
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="h-1 w-6 rounded-full bg-primary" />
            Daily van: the four offices
          </span>
        </Switch>
        <Switch size="sm" color="secondary" isSelected={showAirport} onValueChange={setShowAirport}>
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="w-6 border-t-[3px] border-dashed border-secondary" />
            Planned: Flushing to JFK
          </span>
        </Switch>
      </div>
    </div>
  );
}
