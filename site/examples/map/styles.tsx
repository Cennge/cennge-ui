"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "cennge-ui";
import { Map, MapControls, openFreeMapStyles, type MapProps } from "cennge-ui/map";

const styles: Record<string, MapProps["mapStyle"]> = {
  // undefined: the default, OpenFreeMap's Positron in the theme's colours.
  Theme: undefined,
  Liberty: openFreeMapStyles.liberty,
  Bright: openFreeMapStyles.bright,
  // One style per theme, swapped with it.
  "Positron and Dark": { light: openFreeMapStyles.positron, dark: openFreeMapStyles.dark },
};

export default function BaseMaps() {
  const [name, setName] = useState("Theme");

  return (
    <div className="flex w-full flex-col gap-3">
      <ToggleGroup aria-label="Base map" size="sm" value={name} onValueChange={(next) => next && setName(next)} className="self-start">
        {Object.keys(styles).map((style) => (
          <ToggleGroupItem key={style} value={style}>
            {style}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Map
        aria-label="Lower Manhattan"
        mapStyle={styles[name]}
        defaultCenter={[-74.003, 40.712]}
        defaultZoom={13.5}
        scrollZoom={false}
        className="h-80"
      >
        <MapControls />
      </Map>
    </div>
  );
}
