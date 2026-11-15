"use client";

import { CenngeProvider } from "cennge-ui";
import { BarChart } from "cennge-ui/charts";

const months = [
  { month: "juil.", minutes: 2340 },
  { month: "août", minutes: 2370 },
  { month: "sept.", minutes: 2700 },
  { month: "oct.", minutes: 2840 },
];

export default function FrenchChart() {
  return (
    <CenngeProvider locale="fr-FR">
      <div lang="fr" className="w-full">
        <BarChart
          aria-label="Minutes de CI par mois"
          data={months}
          index="month"
          indexLabel="Mois"
          series={[{ key: "minutes", label: "Minutes" }]}
          labels={{ keyboardHint: "Les flèches passent d’une valeur à l’autre.", empty: "Aucune donnée" }}
          className="h-56"
        />
      </div>
    </CenngeProvider>
  );
}
