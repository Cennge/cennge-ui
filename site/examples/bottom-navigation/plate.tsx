"use client";

import { useState } from "react";
import { BottomNavigation, BottomNavigationItem } from "cennge-ui";

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const places = [
  { key: "today", label: "Today", icon: icon("M4 12h4l3-8 4 16 3-8h2") },
  { key: "runs", label: "Runs", icon: icon("M5 4h14v16H5zM9 9h6M9 13h6"), badge: 3 },
  { key: "stats", label: "Stats", icon: icon("M4 19V9M10 19V5M16 19v-7M22 19H2") },
  { key: "profile", label: "Profile", icon: icon("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0"), badge: true },
];

export default function AppTabs() {
  const [current, setCurrent] = useState("today");
  const place = places.find((entry) => entry.key === current)!;

  return (
    <div className="flex h-[30rem] w-full max-w-[22rem] flex-col overflow-hidden rounded-[1.75rem] border border-border bg-surface-1">
      <div className="flex-1 overflow-y-auto p-5">
        <h3 className="text-xl font-semibold">{place.label}</h3>
        <p className="mt-2 text-sm text-muted">
          {current === "runs" ? "3 CI runs failed since your last visit." : "Pick another place below."}
        </p>
      </div>
      <BottomNavigation aria-label="Main" position="static">
        {places.map((entry) => (
          <BottomNavigationItem
            key={entry.key}
            icon={entry.icon}
            label={entry.label}
            badge={entry.badge}
            isActive={current === entry.key}
            onClick={() => setCurrent(entry.key)}
          />
        ))}
      </BottomNavigation>
    </div>
  );
}
