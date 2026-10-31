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
  { name: "Манхэттен", city: "Офис в Мидтауне", lngLat: [-73.9855, 40.758], projects: ["cennge-ui", "payload-cache"] },
  { name: "Бруклин", city: "Офис в Дамбо", lngLat: [-73.9888, 40.7033], projects: ["spredo-crypto-screener"] },
  { name: "Квинс", city: "Склад и сервисный центр во Флашинге", lngLat: [-73.8331, 40.7675], projects: ["ai-niche-scout"] },
  { name: "Бронкс", city: "Команда тестирования", lngLat: [-73.8648, 40.8448], projects: ["playwright-msi-scraper"] },
];

// Мидтаун — Бронкс — Флашинг — Дамбо: по главным дорогам, грубо.
const route: LngLat[] = [
  [-73.9855, 40.758],
  [-73.944, 40.804],
  [-73.93, 40.835],
  [-73.8648, 40.8448],
  [-73.825, 40.8],
  [-73.8331, 40.7675],
  [-73.87, 40.73],
  [-73.93, 40.71],
  [-73.9888, 40.7033],
];

/** Шестиугольники вокруг Манхэттена со «спросом»: плотнее к центру, с рябью. */
function hexagons() {
  const center: LngLat = [-73.95, 40.74];
  const size = 0.007; // градусов широты
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

/** 2000 пунктов самовывоза вокруг офисов: одинаковые от запуска к запуску. */
function pickupPoints() {
  let seed = 11;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 2000 }, (_, index) => {
    const office = offices[index % offices.length]!;
    const spread = index % 7 === 0 ? 0.1 : 0.04;
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
      <Map
        aria-label="Заказы по районам Нью-Йорка"
        labels={labels}
        defaultBounds={[
          [-74.1, 40.64],
          [-73.8, 40.84],
        ]}
        scrollZoom={false}
        className="h-80"
      >
        <MapGeoJSON data={demand} valueProperty="orders" tooltip={(cell) => `${String(cell.orders)} заказов в день`} />
        <MapLegend title="Заказов в день" domain={[0, 130]} />
        <MapControls showCompass={false} />
      </Map>
      <Map
        aria-label="Пункты самовывоза и поставки"
        labels={labels}
        // Группы в стороне от кнопок справа: под ними их не нажать.
        defaultBounds={[
          [-74.05, 40.66],
          [-73.8, 40.87],
        ]}
        boundsPadding={{ top: 56, right: 72, bottom: 48, left: 48 }}
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
          // Все четыре офиса на экране любой ширины, в стороне от кнопок справа.
          defaultBounds={[
            [-74.01, 40.69],
            [-73.82, 40.86],
          ]}
          boundsPadding={{ top: 56, right: 72, bottom: 48, left: 48 }}
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
