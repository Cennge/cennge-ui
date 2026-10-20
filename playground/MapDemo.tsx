import { useState, type ReactNode } from "react";
import { Badge, Button, Switch } from "cennge-ui";
import { Map, MapControls, MapMarker, MapPopup, MapRoute, type LngLat, type MapLabels } from "cennge-ui/map";

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
      </div>
    </Section>
  );
}
