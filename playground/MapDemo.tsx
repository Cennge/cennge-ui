import { useMemo, useState, type ReactNode } from "react";
import { Badge, Button, Switch } from "cennge-ui";
import {
  Map,
  MapArc,
  MapClusterLayer,
  MapControls,
  MapGeoJSON,
  MapLegend,
  MapMarker,
  MapPopup,
  MapRoute,
  type LngLat,
  type MapLabels,
} from "cennge-ui/map";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-large bg-surface-2 p-6 shadow-raised">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

const labels: Partial<MapLabels> = {
  canvas: "Карта. Стрелки двигают её, плюс и минус меняют масштаб.",
  zoomIn: "Приблизить",
  zoomOut: "Отдалить",
  resetNorth: "Повернуть на север",
  locate: "Показать, где я",
  locationUnavailable: "Не удалось определить, где вы",
  yourLocation: "Вы здесь",
  enterFullscreen: "Во весь экран",
  exitFullscreen: "Выйти из полноэкранного режима",
  close: "Закрыть",
  loadError: "Карта не загрузилась",
  attribution: "Источники карты",
};

const offices: { name: string; city: string; lngLat: LngLat; projects: string[] }[] = [
  { name: "Москва", city: "Офис на Тверской", lngLat: [37.6062, 55.7642], projects: ["cennge-ui", "payload-cache"] },
  { name: "Санкт-Петербург", city: "Офис на Литейном", lngLat: [30.3482, 59.9386], projects: ["spredo-crypto-screener"] },
  { name: "Казань", city: "Склад и сервисный центр", lngLat: [49.1221, 55.7887], projects: ["ai-niche-scout"] },
  { name: "Нижний Новгород", city: "Команда тестирования", lngLat: [44.002, 56.3287], projects: ["playwright-msi-scraper"] },
];

// Москва — Нижний Новгород — Казань: по трассе М-12, грубо.
const route: LngLat[] = [
  [37.6062, 55.7642],
  [39.0, 55.95],
  [40.4, 56.13],
  [42.2, 56.2],
  [44.002, 56.3287],
  [46.0, 56.1],
  [47.6, 55.95],
  [49.1221, 55.7887],
];

/** Шестиугольники вокруг Москвы со «спросом»: плотнее к центру, с рябью. */
function hexagons() {
  const center: LngLat = [37.62, 55.75];
  const size = 0.022; // градусов широты
  const stretch = 1 / Math.cos((center[1] * Math.PI) / 180);
  const features = [];
  for (let q = -14; q <= 14; q++) {
    for (let r = -14; r <= 14; r++) {
      if (Math.abs(q + r) > 14) continue;
      const x = center[0] + size * 1.5 * q * stretch;
      const y = center[1] + size * Math.sqrt(3) * (r + q / 2);
      const distance = Math.hypot(q, r, q + r) / 2;
      const orders = Math.round(Math.max(0, 125 - distance * 8 + Math.sin(q * 1.7 + r) * 12));
      const ring = Array.from({ length: 7 }, (_, corner) => {
        const angle = (Math.PI / 3) * (corner % 6);
        return [x + size * Math.cos(angle) * stretch, y + size * Math.sin(angle)];
      });
      features.push({
        type: "Feature" as const,
        properties: { orders },
        geometry: { type: "Polygon" as const, coordinates: [ring] },
      });
    }
  }
  return { type: "FeatureCollection" as const, features };
}

/** 2000 пунктов самовывоза вокруг городов: одинаковые от запуска к запуску. */
function pickupPoints() {
  let seed = 11;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 2000 }, (_, index) => {
    const office = offices[index % offices.length]!;
    const spread = index % 7 === 0 ? 2.5 : 0.6;
    return {
      name: `Пункт ${index + 1}`,
      lngLat: [office.lngLat[0] + (random() - 0.5) * spread * 1.8, office.lngLat[1] + (random() - 0.5) * spread] as LngLat,
    };
  });
}

function DataMaps() {
  const demand = useMemo(hexagons, []);
  const points = useMemo(pickupPoints, []);
  const [picked, setPicked] = useState<string | null>(null);
  const supplies = offices.slice(1).map((office) => ({ from: offices[0]!.lngLat, to: office.lngLat }));
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Map aria-label="Заказы по районам Москвы" labels={labels} defaultCenter={[37.62, 55.75]} defaultZoom={9.2} scrollZoom={false} className="h-80">
        <MapGeoJSON data={demand} valueProperty="orders" tooltip={(cell) => `${String(cell.orders)} заказов в день`} />
        <MapLegend title="Заказов в день" domain={[0, 130]} />
        <MapControls showCompass={false} />
      </Map>
      <Map
        aria-label="Пункты самовывоза и поставки"
        labels={labels}
        defaultBounds={[
          [29, 54.8],
          [50.5, 60.5],
        ]}
        scrollZoom={false}
        className="h-80"
      >
        <MapArc arcs={supplies} color="secondary" />
        <MapClusterLayer
          items={points}
          getLngLat={(point) => point.lngLat}
          getLabel={(point) => point.name}
          onItemClick={(point) => setPicked(point.name)}
          clusterLabel={(_count, shown) => `${shown} пунктов`}
        />
        <MapControls showCompass={false} />
      </Map>
      <p className="text-sm text-muted lg:col-start-2">Выбран: {picked ?? "ничего"}</p>
    </div>
  );
}

export function MapDemo() {
  const [clicked, setClicked] = useState<LngLat | null>(null);
  const [scrollZoom, setScrollZoom] = useState(false);

  return (
    <Section title="Map">
      <div className="flex flex-col gap-4">
        <Map
          aria-label="Офисы и маршрут доставки"
          labels={labels}
          defaultCenter={[41.5, 57.3]}
          defaultZoom={4.6}
          scrollZoom={scrollZoom}
          onMapClick={setClicked}
          className="h-[28rem]"
        >
          <MapRoute coordinates={route} />
          <MapControls showLocate showFullscreen />
          {offices.map((office) => (
            <MapMarker
              key={office.name}
              lngLat={office.lngLat}
              label={office.name}
              tooltip={office.name}
              popup={
                <div className="flex flex-col gap-2">
                  <div>
                    <p className="font-semibold">{office.name}</p>
                    <p className="text-muted">{office.city}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {office.projects.map((project) => (
                      <Badge key={project} variant="flat" size="sm">
                        {project}
                      </Badge>
                    ))}
                  </div>
                  <Button size="sm" color="primary" className="self-start">
                    Маршрут сюда
                  </Button>
                </div>
              }
            />
          ))}
          {clicked ? (
            <MapPopup lngLat={clicked} isOpen onOpenChange={() => setClicked(null)} label="Выбранная точка">
              <p className="text-muted">Координаты</p>
              <p className="font-medium tabular-nums">
                {clicked[1].toFixed(4)}, {clicked[0].toFixed(4)}
              </p>
            </MapPopup>
          ) : null}
        </Map>
        <Switch isSelected={scrollZoom} onValueChange={setScrollZoom}>
          Масштаб колесом мыши (выключен, чтобы страница прокручивалась мимо карты)
        </Switch>
        <DataMaps />
      </div>
    </Section>
  );
}
