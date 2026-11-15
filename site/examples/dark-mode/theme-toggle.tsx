"use client";

import { Button, useTheme } from "cennge-ui";

const icon = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme({ defaultTheme: "dark" });

  return (
    <div className="flex w-full max-w-md items-center justify-between gap-4 rounded-large bg-surface-3 py-2 pr-2 pl-4">
      <span className="font-semibold">payload-cache</span>
      <Button
        isIconOnly
        variant="light"
        aria-label="Dark theme"
        // No attribute until the theme is known, after hydration.
        aria-pressed={resolvedTheme === undefined ? undefined : resolvedTheme === "dark"}
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        {/* CSS picks the icon, so the server's HTML is already right. */}
        <svg {...icon} className="size-5 dark:hidden">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
        <svg {...icon} className="hidden size-5 dark:block">
          <path d="M20.5 14.1A8.5 8.5 0 1 1 9.9 3.5a6.6 6.6 0 0 0 10.6 10.6Z" />
        </svg>
      </Button>
    </div>
  );
}
