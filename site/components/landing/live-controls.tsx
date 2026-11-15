"use client";

import { ThemeSwitch } from "cennge-ui";
import { AccentSwitch } from "@/components/accent-switch";

/** The accent and theme pickers. Several sets can sit on one page: each follows the others. */
export function LiveControls({ className = "", labelClassName = "text-muted" }: { className?: string; labelClassName?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-3 ${className}`}>
      <div className="flex items-center gap-2.5">
        <span className={`text-[15px] ${labelClassName}`}>Accent</span>
        <AccentSwitch />
      </div>
      <div className="flex items-center gap-2.5">
        <span className={`text-[15px] ${labelClassName}`}>Theme</span>
        <ThemeSwitch defaultTheme="dark" />
      </div>
    </div>
  );
}
