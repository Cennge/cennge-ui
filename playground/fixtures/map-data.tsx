import { useMemo, useState } from "react";
import {
  Map,
  MapArc,
  MapClusterLayer,
  MapGeoJSON,
  MapLegend,
  blankMapStyle,
  type LngLat,
} from "cennge-ui/map";

const style = { light: blankMapStyle("#e4e7ec"), dark: blankMapStyle("#1b1e24") };

// Six squares in a grid, each a region with a value: the choropleth's shades go from the first to the last.
const regions = {
  type: "FeatureCollection" as const,
  features: Array.from({ length: 6 }, (_, index) => {
    const x = 10 + (index % 3) * 10;
    const y = 40 + Math.floor(index / 3) * 10;
    return {
      type: "Feature" as const,
      properties: { name: `Region ${index + 1}`, downloads: (index + 1) * 1000 },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [x, y],
            [x + 9, y],
            [x + 9, y + 9],
            [x, y + 9],
            [x, y],
          ],
        ],
      },
    };
  }),
};

const hub: LngLat = [14.5, 44.5];
const arcs = [
  { from: hub, to: [24.5, 44.5] as LngLat },
  { from: hub, to: [34.5, 54.5] as LngLat },
  { from: hub, to: [24.5, 54.5] as LngLat },
];

/** Stores spread around a few towns, the same on every run. */
function stores() {
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const towns: LngLat[] = [
    [37.62, 55.75],
    [30.33, 59.93],
    [49.11, 55.79],
  ];
  return Array.from({ length: 500 }, (_, index) => {
    const town = towns[index % towns.length]!;
    return { id: index + 1, name: `Store ${index + 1}`, lngLat: [town[0] + (random() - 0.5) * 3, town[1] + (random() - 0.5) * 1.5] as LngLat };
  });
}

export default function MapDataFixture() {
  const [picked, setPicked] = useState("none");
  const [store, setStore] = useState("none");
  const items = useMemo(stores, []);

  return (
    <div className="flex flex-col gap-4">
      <Map
        aria-label="Downloads by region"
        mapStyle={style}
        defaultBounds={[
          [10, 40],
          [39, 59],
        ]}
        className="h-80"
        onLoad={(map) => Object.assign(window, { regionMap: map })}
      >
        <MapGeoJSON
          data={regions}
          valueProperty="downloads"
          tooltip={(region) => `${String(region.name)}: ${Number(region.downloads)}`}
          onFeatureClick={(region) => setPicked(String(region.name))}
        />
        <MapArc arcs={arcs} color="secondary" />
        <MapLegend title="Downloads" domain={[1000, 6000]} />
      </Map>
      <p data-testid="picked" className="text-sm text-muted">
        picked {picked}
      </p>

      <Map
        aria-label="Stores"
        mapStyle={style}
        defaultBounds={[
          [28, 53],
          [52, 61],
        ]}
        className="h-80"
        onLoad={(map) => Object.assign(window, { storeMap: map })}
      >
        <MapClusterLayer
          items={items}
          getLngLat={(item) => item.lngLat}
          getLabel={(item) => item.name}
          onItemClick={(item) => setStore(item.name)}
          clusterLabel={(_count, shown) => `${shown} stores`}
        />
      </Map>
      <p data-testid="store" className="text-sm text-muted">
        store {store}
      </p>
    </div>
  );
}
