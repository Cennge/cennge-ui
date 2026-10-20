import { useState } from "react";
import { Button } from "cennge-ui";
import { Map, MapControls, MapMarker, MapPopup, MapRoute, blankMapStyle, type LngLat, type MapView } from "cennge-ui/map";

// Offline: a background in each theme's colours and nothing to download, so tests see the same map every time.
const style = { light: blankMapStyle("#e4e7ec"), dark: blankMapStyle("#1b1e24") };

const moscow: LngLat = [37.6173, 55.7558];
const kazan: LngLat = [49.1088, 55.7963];
const nizhny: LngLat = [44.0059, 56.3269];

export default function MapFixture() {
  const [view, setView] = useState<MapView | null>(null);
  const [clicked, setClicked] = useState<LngLat | null>(null);
  const [opened, setOpened] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <Map
        aria-label="Office map"
        mapStyle={style}
        // Moscow to Kazan on any screen, clear of the controls on the right.
        defaultBounds={[
          [37.6, 55.3],
          [49.2, 56.6],
        ]}
        boundsPadding={{ top: 72, right: 72, bottom: 48, left: 48 }}
        className="h-96"
        onViewChange={setView}
        onMapClick={setClicked}
        // For the e2e spec: the MapLibre map, to read its layers and move it.
        onLoad={(map) => Object.assign(window, { cenngeMap: map })}
      >
        <MapRoute coordinates={[moscow, nizhny, kazan]} />
        <MapRoute coordinates={[moscow, [40.4, 56.13]]} color="secondary" dashed />
        <MapControls showLocate showFullscreen />
        <MapMarker
          lngLat={moscow}
          label="Moscow office"
          tooltip="Moscow"
          onPopupOpenChange={(isOpen) => isOpen && setOpened((count) => count + 1)}
          popup={
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Moscow office</p>
              <p className="text-muted">cennge-ui and payload-cache are built here.</p>
              <Button size="sm" color="primary">
                Directions
              </Button>
            </div>
          }
        />
        <MapMarker lngLat={nizhny} label="Nizhny Novgorod" tooltip="Nizhny Novgorod" color="success" />
        <MapMarker lngLat={kazan} label="Kazan warehouse" anchor="bottom" onClick={() => setOpened((count) => count + 1)}>
          <span className="rounded-full bg-surface-4 px-2 py-0.5 text-xs font-semibold shadow-raised">Kazan</span>
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
