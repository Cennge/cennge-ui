"use client";

const slots = [
  { name: "chart-1", swatch: "bg-chart-1" },
  { name: "chart-2", swatch: "bg-chart-2" },
  { name: "chart-3", swatch: "bg-chart-3" },
  { name: "chart-4", swatch: "bg-chart-4" },
  { name: "chart-5", swatch: "bg-chart-5" },
  { name: "chart-6", swatch: "bg-chart-6" },
  { name: "chart-7", swatch: "bg-chart-7" },
  { name: "chart-8", swatch: "bg-chart-8" },
  { name: "default", swatch: "bg-default-500" },
];

export default function Palette() {
  return (
    <ul className="grid w-full grid-cols-3 gap-3 sm:grid-cols-9">
      {slots.map((slot) => (
        <li key={slot.name} className="flex flex-col gap-1.5">
          <span className={`h-10 rounded-medium ${slot.swatch}`} />
          <span className="font-code text-xs text-muted">{slot.name}</span>
        </li>
      ))}
    </ul>
  );
}
