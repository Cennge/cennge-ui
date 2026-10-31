import { useState } from "react";
import { Button } from "cennge-ui";
import { Map, MapControls, MapMarker, MapPopup, MapRoute, blankMapStyle, type LngLat, type MapView } from "cennge-ui/map";

// Offline: a background in each theme's colours and nothing to download, so tests see the same map every time.
const style = { light: blankMapStyle("#e4e7ec"), dark: blankMapStyle("#1b1e24") };

const manhattan: LngLat = [-73.9855, 40.758];
const jfk: LngLat = [-73.7781, 40.6413];
const flushing: LngLat = [-73.8331, 40.7675];

export default function MapFixture() {
  const [view, setView] = useState<MapView | null>(null);
  const [clicked, setClicked] = useState<LngLat | null>(null);
  const [opened, setOpened] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <Map
        aria-label="Office map"
        mapStyle={style}
        // Manhattan to JFK on any screen, clear of the controls on the right.
        defaultBounds={[
          [-74, 40.63],
          [-73.77, 40.78],
        ]}
        boundsPadding={{ top: 72, right: 72, bottom: 48, left: 48 }}
        className="h-96"
        onViewChange={setView}
        onMapClick={setClicked}
        // For the e2e spec: the MapLibre map, to read its layers and move it.
        onLoad={(map) => Object.assign(window, { cenngeMap: map })}
      >
        <MapRoute coordinates={[manhattan, flushing, jfk]} />
        <MapRoute coordinates={[manhattan, [-73.92, 40.7]]} color="secondary" dashed />
        <MapControls showLocate showFullscreen />
        <MapMarker
          lngLat={manhattan}
          label="Manhattan office"
          tooltip="Manhattan"
          onPopupOpenChange={(isOpen) => isOpen && setOpened((count) => count + 1)}
          popup={
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Manhattan office</p>
              <p className="text-muted">cennge-ui and payload-cache are built here.</p>
              <Button size="sm" color="primary">
                Directions
              </Button>
            </div>
          }
        />
        <MapMarker lngLat={flushing} label="Flushing" tooltip="Flushing" color="success" />
        <MapMarker lngLat={jfk} label="JFK warehouse" anchor="bottom" onClick={() => setOpened((count) => count + 1)}>
          <span className="rounded-full bg-surface-4 px-2 py-0.5 text-xs font-semibold shadow-raised">JFK</span>
        </MapMarker>
        {clicked ? (
          <MapPopup lngLat={clicked} isOpen onOpenChange={() => setClicked(null)} label="Clicked point">
            <p className="tabular-nums">
              {clicked[1].toFixed(2)}, {clicked[0].toFixed(2)}
            </p>
          </MapPopup>
        ) : null}
      </Map>
      <p data-testid="view" className="text-sm text-muted tabular-nums">
        {view ? `zoom ${view.zoom.toFixed(1)}, bearing ${Math.round(view.bearing)}` : "not moved"}
      </p>
      <p data-testid="opened" className="text-sm text-muted">
        opened {opened}
      </p>
    </div>
  );
}
