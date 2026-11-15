"use client";

import { Carousel, CarouselContent, CarouselControls, CarouselItem } from "cennge-ui";

const tips = [
  { title: "One attribute for the accent", text: 'Set data-accent="blue" on any element and everything inside takes the blue accent.' },
  { title: "Every colour is a variable", text: "Colours, radii and surfaces are --cennge-* CSS variables: recolour without a rebuild." },
  { title: "Search from anywhere", text: "Press Ctrl K, or Command K on a Mac, to search these docs." },
];

export default function Tips() {
  return (
    <Carousel aria-label="Tips" autoplay loop className="w-full max-w-md">
      <CarouselContent>
        {tips.map((tip) => (
          <CarouselItem key={tip.title}>
            <div className="flex h-32 flex-col gap-2 rounded-large bg-surface-3 p-5">
              <p className="font-semibold">{tip.title}</p>
              <p className="text-sm text-muted">{tip.text}</p>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselControls />
    </Carousel>
  );
}
