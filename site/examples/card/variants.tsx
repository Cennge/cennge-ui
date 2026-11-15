"use client";

import { Card, CardBody, type CardVariant } from "cennge-ui";

const cards: { variant: CardVariant; name: string; description: string }[] = [
  { variant: "raised", name: "cennge-ui", description: "React UI library" },
  { variant: "bordered", name: "payload-cache", description: "FastAPI cache service" },
  { variant: "flat", name: "ai-niche-scout", description: "Finds niches worth building for" },
];

export default function CardVariants() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.variant} variant={card.variant}>
          <CardBody>
            <span className="text-xs font-medium text-muted">{card.variant}</span>
            <span className="truncate font-semibold">{card.name}</span>
            <span className="text-sm text-muted">{card.description}</span>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
