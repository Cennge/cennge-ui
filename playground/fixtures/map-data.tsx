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

// Six squares in a grid over New York, each a region with a value: the choropleth's shades go from the first
// to the last.
const regions = {
  type: "FeatureCollection" as const,
  features: Array.from({ length: 6 }, (_, index) => {
    const x = -74.06 + (index % 3) * 0.06;
    const y = 40.66 + Math.floor(index / 3) * 0.06;
    return {
      type: "Feature" as const,
      properties: { name: `Region ${index + 1}`, downloads: (index + 1) * 1000 },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [x, y],
            [x + 0.05, y],
            [x + 0.05, y + 0.05],
            [x, y + 0.05],
            [x, y],
          ],
        ],
      },
    };
  }),
};

// From the middle of the first square to the middles of three others.
const hub: LngLat = [-74.035, 40.685];
const arcs = [
  { from: hub, to: [-73.975, 40.685] as LngLat },
  { from: hub, to: [-73.915, 40.745] as LngLat },
  { from: hub, to: [-73.975, 40.745] as LngLat },
];

/** Stores spread around Manhattan, Brooklyn and Queens, the same on every run. */
function stores() {
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const boroughs: LngLat[] = [
    [-73.97, 40.78],
    [-73.95, 40.65],
    [-73.8, 40.72],
  ];
  // Close enough that each borough's stores make one group at the first zoom.
  return Array.from({ length: 500 }, (_, index) => {
    const borough = boroughs[index % boroughs.length]!;
    return { id: index + 1, name: `Store ${index + 1}`, lngLat: [borough[0] + (random() - 0.5) * 0.04, borough[1] + (random() - 0.5) * 0.02] as LngLat };
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
          [-74.06, 40.66],
          [-73.89, 40.77],
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
          [-74.02, 40.62],
          [-73.76, 40.81],
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
