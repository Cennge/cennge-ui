"use client";

import { useState } from "react";
import { Slider } from "cennge-ui";
import { Map, MapMarker, MapRoute, type LngLat } from "cennge-ui/map";

// Midtown down Broadway, over the Brooklyn Bridge to Dumbo.
const route: LngLat[] = [
  [-73.9855, 40.758],
  [-73.9903, 40.7359],
  [-73.9967, 40.7251],
  [-74.0021, 40.7192],
  [-74.0067, 40.7143],
  [-74.0028, 40.7116],
  [-73.9934, 40.7041],
  [-73.9888, 40.7033],
];

/** The line cut at a share of its length: the part travelled and the part still to go. */
function cut(line: LngLat[], share: number): [LngLat[], LngLat[]] {
  // A degree of longitude is about 0.76 of a degree of latitude in New York.
  const lengths = line.slice(1).map(([lng, lat], index) => Math.hypot((lng - line[index]![0]) * 0.76, lat - line[index]![1]));
  let left = share * lengths.reduce((sum, length) => sum + length, 0);
  for (const [index, length] of lengths.entries()) {
    if (left <= length) {
      const [from, to] = [line[index]!, line[index + 1]!];
      const t = length ? left / length : 0;
      const here: LngLat = [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
      return [[...line.slice(0, index + 1), here], [here, ...line.slice(index + 1)]];
    }
    left -= length;
  }
  return [line, line.slice(-2)];
}

export default function DeliveryProgress() {
  const [percent, setPercent] = useState(40);
  const [travelled, toGo] = cut(route, percent / 100);

  return (
    <div className="flex w-full flex-col gap-4">
      <Map
        aria-label="Delivery from Midtown to Dumbo"
        defaultBounds={[
          [-74.0067, 40.7033],
          [-73.9855, 40.758],
        ]}
        scrollZoom={false}
        className="h-96"
      >
        <MapRoute coordinates={toGo} color="default" width={3} dashed />
        <MapRoute coordinates={travelled} />
        <MapMarker lngLat={travelled.at(-1)!} label="The van" size="lg" />
      </Map>
      <Slider label="Delivered so far" value={percent} onValueChange={setPercent} formatValue={(value) => `${value}%`} className="w-full max-w-80" />
    </div>
  );
}
