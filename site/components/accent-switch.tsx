"use client";

import { useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "cennge-ui";
import { accents, accentStorageKey, type Accent } from "@/lib/accent";

const swatch: Record<Accent, string> = {
  orange: "bg-[var(--cennge-orange-500)]",
  blue: "bg-[var(--cennge-blue-500)]",
  green: "bg-[var(--cennge-green-500)]",
  violet: "bg-[var(--cennge-violet-500)]",
  red: "bg-[var(--cennge-red-500)]",
};

function read(): Accent {
  const value = document.documentElement.getAttribute("data-accent");
  return (accents as readonly string[]).includes(value ?? "") ? (value as Accent) : "orange";
}

/** The five accent presets: sets data-accent on <html>, the way an app would, and remembers it. */
export function AccentSwitch({ className }: { className?: string }) {
  // Unknown on the server: nothing is pressed until the stored accent has been read.
  const [accent, setAccent] = useState<Accent | undefined>(undefined);
  // Follows the attribute, so two switches on one page (or any other code setting it) agree.
  useEffect(() => {
    setAccent(read());
    const observer = new MutationObserver(() => setAccent(read()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-accent"] });
    return () => observer.disconnect();
  }, []);

  return (
    <ToggleGroup
      size="sm"
      aria-label="Accent colour"
      value={accent ?? null}
      onValueChange={(value) => {
        if (!value) return;
        const next = value as Accent;
        if (next === "orange") document.documentElement.removeAttribute("data-accent");
        else document.documentElement.setAttribute("data-accent", next);
        try {
          localStorage.setItem(accentStorageKey, next);
        } catch {}
        setAccent(next);
      }}
      className={className}
    >
      {accents.map((name) => (
        <ToggleGroupItem key={name} value={name} aria-label={`${name[0]!.toUpperCase()}${name.slice(1)} accent`} isIconOnly>
          <span className={`block size-3.5 rounded-full ${swatch[name]} ring-offset-2 ring-offset-background`} aria-hidden="true" />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
