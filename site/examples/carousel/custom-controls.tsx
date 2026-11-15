"use client";

import { useId } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, useCarousel } from "cennge-ui";

const charts = [
  { name: "BarChart", text: "Columns or horizontal bars, grouped or stacked." },
  { name: "LineChart", text: "Change over time, straight or smooth; a missing value breaks the line." },
  { name: "AreaChart", text: "Lines with a wash below, stacked or not." },
  { name: "DonutChart", text: "A whole and its parts, as a ring with the total in the middle or as a pie." },
  { name: "Sparkline", text: "A trend at a glance, beside the number it belongs to." },
];

/** Inside <Carousel>, useCarousel gives the position and the moves. */
function Header({ titleId }: { titleId: string }) {
  const { index, count } = useCarousel();
  return (
    <div className="flex items-center gap-2">
      <p id={titleId} className="font-semibold">
        New in cennge-ui 0.3.0
      </p>
      <span className="ml-auto text-sm text-muted tabular-nums" aria-hidden="true">
        {index + 1} / {count}
      </span>
      <CarouselPrevious />
      <CarouselNext />
    </div>
  );
}

export default function ChartsCarousel() {
  const titleId = useId();
  return (
    <Carousel aria-labelledby={titleId} className="w-full max-w-md">
      <Header titleId={titleId} />
      <CarouselContent>
        {charts.map((chart) => (
          <CarouselItem key={chart.name}>
            <div className="flex h-28 flex-col gap-1.5 rounded-large bg-surface-3 p-5">
              <code className="font-mono font-semibold text-primary-text">{chart.name}</code>
              <p className="text-sm text-muted">{chart.text}</p>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
