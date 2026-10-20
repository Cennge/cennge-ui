import type { StyleSpecification } from "maplibre-gl";

type Rgb = [number, number, number];

/** #rgb, #rrggbb, rgb() and rgba(): what the theme's tokens resolve to. */
function parseColor(value: string): Rgb | null {
  const text = value.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text)?.[1];
  if (hex) {
    const full = hex.length === 3 ? hex.replace(/./g, (digit) => digit + digit) : hex;
    return [0, 2, 4].map((start) => parseInt(full.slice(start, start + 2), 16)) as Rgb;
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(text);
  return rgb ? [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])] : null;
}

const format = ([r, g, b]: Rgb) => `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

/** `amount` of `b` in `a`, in sRGB: enough for tints of a few percent. */
function mix(a: Rgb, b: Rgb, amount: number): string {
  return format([0, 1, 2].map((index) => a[index]! + (b[index]! - a[index]!) * amount) as Rgb);
}

export interface MapPalette {
  land: string;
  urban: string;
  park: string;
  ice: string;
  water: string;
  waterLine: string;
  building: string;
  buildingOutline: string;
  roadCasing: string;
  roadMinor: string;
  roadMajor: string;
  motorway: string;
  rail: string;
  boundary: string;
  label: string;
  strongLabel: string;
  waterLabel: string;
  halo: string;
}

/** The base map's colours, from the theme's tokens around `node`: surfaces for land and roads, a touch of info for water. */
export function readPalette(node: Element, theme: "light" | "dark"): MapPalette {
  const style = getComputedStyle(node);
  const token = (name: string, fallback: Rgb): Rgb => parseColor(style.getPropertyValue(`--cennge-${name}`)) ?? fallback;
  const s1 = token("surface-1", theme === "dark" ? [17, 19, 23] : [238, 240, 243]);
  const s2 = token("surface-2", theme === "dark" ? [24, 27, 32] : [246, 247, 249]);
  const s3 = token("surface-3", theme === "dark" ? [33, 37, 43] : [251, 251, 252]);
  const s4 = token("surface-4", theme === "dark" ? [44, 48, 56] : [255, 255, 255]);
  const foreground = token("foreground", theme === "dark" ? [232, 234, 238] : [22, 25, 29]);
  const muted = token("muted", theme === "dark" ? [154, 162, 174] : [85, 93, 105]);
  const border = token("border", theme === "dark" ? [47, 52, 60] : [221, 225, 230]);
  const info = token("info", [37, 99, 235]);
  const success = token("success", [34, 197, 94]);
  const grey = token("default-500", [103, 112, 129]);

  if (theme === "dark") {
    const land = format(s2);
    return {
      land,
      urban: mix(s2, s3, 0.45),
      park: mix(s2, success, 0.07),
      ice: format(s3),
      water: mix(s1, info, 0.2),
      waterLine: mix(s1, info, 0.32),
      building: format(s3),
      buildingOutline: format(s4),
      roadCasing: format(s1),
      roadMinor: format(s3),
      roadMajor: format(s4),
      motorway: mix(s4, grey, 0.35),
      rail: format(s4),
      boundary: mix(s4, grey, 0.6),
      label: format(muted),
      strongLabel: mix(muted, foreground, 0.7),
      waterLabel: mix(info, foreground, 0.45),
      halo: land,
    };
  }
  const land = format(s3);
  return {
    land,
    urban: mix(s3, s1, 0.55),
    park: mix(s3, success, 0.11),
    ice: format(s4),
    water: mix(s4, info, 0.2),
    waterLine: mix(s4, info, 0.32),
    building: format(s1),
    buildingOutline: format(border),
    roadCasing: format(border),
    roadMinor: format(s4),
    roadMajor: format(s4),
    motorway: mix(s4, grey, 0.12),
    rail: mix(border, grey, 0.3),
    boundary: mix(border, grey, 0.55),
    label: format(muted),
    strongLabel: mix(muted, foreground, 0.75),
    waterLabel: mix(info, foreground, 0.35),
    halo: land,
  };
}

const matches = (id: string, pattern: RegExp) => pattern.test(id);

/**
 * OpenFreeMap's Positron, recoloured: every colour of its layers (all grey) is replaced by the palette's,
 * picked by what the layer draws, judged from its id. Widths, opacities and zoom rules stay as they are.
 */
export function tintStyle(style: StyleSpecification, palette: MapPalette): StyleSpecification {
  const layers = style.layers.map((layer) => {
    const id = layer.id.toLowerCase();
    const paint: Record<string, unknown> = { ...(layer.paint as Record<string, unknown> | undefined) };
    switch (layer.type) {
      case "background":
        paint["background-color"] = palette.land;
        break;
      case "fill": {
        const color = matches(id, /water/)
          ? palette.water
          : matches(id, /park|wood|grass|forest/)
            ? palette.park
            : matches(id, /ice|glacier/)
              ? palette.ice
              : matches(id, /building/)
                ? palette.building
                : palette.urban;
        paint["fill-color"] = color;
        if ("fill-outline-color" in paint) paint["fill-outline-color"] = matches(id, /building/) ? palette.buildingOutline : color;
        break;
      }
      case "line":
        paint["line-color"] = matches(id, /waterway|water/)
          ? palette.waterLine
          : matches(id, /boundary|admin/)
            ? palette.boundary
            : matches(id, /dashline/)
              ? palette.land
              : matches(id, /rail/)
                ? palette.rail
                : matches(id, /casing|tunnel/)
                  ? palette.roadCasing
                  : matches(id, /motorway/)
                    ? palette.motorway
                    : matches(id, /major|trunk|primary/)
                      ? palette.roadMajor
                      : palette.roadMinor;
        break;
      case "symbol":
        if (!(layer.layout as Record<string, unknown> | undefined)?.["text-field"]) break;
        paint["text-color"] = matches(id, /water/)
          ? palette.waterLabel
          : matches(id, /city|country|capital|town/)
            ? palette.strongLabel
            : palette.label;
        paint["text-halo-color"] = palette.halo;
        break;
      default:
        break;
    }
    return { ...layer, paint } as typeof layer;
  });
  return { ...style, layers };
}
