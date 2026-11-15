"use client";

import { useMemo, useState } from "react";
import { Map, MapClusterLayer, MapControls, type LngLat } from "cennge-ui/map";

const offices: LngLat[] = [
  [-73.9855, 40.758],
  [-73.9888, 40.7033],
  [-73.8331, 40.7675],
  [-73.8977, 40.8622],
];

/** 2,000 pickup points around the offices, the same on every load. */
function pickupPoints() {
  let seed = 11;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 2000 }, (_, index) => {
    const [lng, lat] = offices[index % offices.length]!;
    const spread = index % 7 === 0 ? 0.06 : 0.03;
    return {
      name: `Pickup point ${index + 1}`,
      lngLat: [lng + (random() - 0.5) * spread * 1.8, lat + (random() - 0.5) * spread] as LngLat,
    };
  });
}

export default function PickupPoints() {
  const points = useMemo(pickupPoints, []);
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <div className="flex w-full flex-col gap-3">
      <Map
        aria-label="Pickup points"
        defaultBounds={[
          [-74.05, 40.66],
          [-73.8, 40.89],
        ]}
        // Groups clear of the buttons on the right.
        boundsPadding={{ top: 48, right: 72, bottom: 48, left: 48 }}
        scrollZoom={false}
        className="h-96"
      >
        <MapClusterLayer
          items={points}
          getLngLat={(point) => point.lngLat}
          getLabel={(point) => point.name}
          onItemClick={(point) => setPicked(point.name)}
          clusterLabel={(_count, shown) => `${shown} pickup points`}
        />
        <MapControls showCompass={false} />
      </Map>
      <p className="text-sm text-muted">{picked ? `Picked ${picked}.` : "Click a group to zoom in, then a point to pick it."}</p>
    </div>
  );
}
