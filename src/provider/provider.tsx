import * as React from "react";
import { Tooltip } from "radix-ui";
import type { CenngeColor, CenngeRadius, CenngeSize } from "../types";

export interface CenngeDefaults {
  color?: CenngeColor;
  size?: CenngeSize;
  radius?: CenngeRadius;
}

export interface CenngeProviderProps extends CenngeDefaults {
  /**
   * `"user"` follows the OS `prefers-reduced-motion` setting (components already do this).
   * `"always"` turns motion off for everything inside the provider.
   * @default "user"
   */
  reducedMotion?: "user" | "always";
  /** Delay before tooltips open, in ms. @default 300 */
  tooltipDelay?: number;
  children?: React.ReactNode;
}

const DefaultsContext = React.createContext<CenngeDefaults>({});

/** Prop defaults set by the nearest <CenngeProvider>. Empty object without a provider. */
export function useCenngeDefaults(): CenngeDefaults {
  return React.useContext(DefaultsContext);
}

/**
 * Optional. Components work without it; use it to set app-wide defaults.
 * Theme and dark mode are CSS (`class="dark"`, `data-accent`), not provider props.
 */
export function CenngeProvider({
  color,
  size,
  radius,
  reducedMotion = "user",
  tooltipDelay = 300,
  children,
}: CenngeProviderProps) {
  const defaults = React.useMemo(() => ({ color, size, radius }), [color, size, radius]);

  let content = <Tooltip.Provider delayDuration={tooltipDelay}>{children}</Tooltip.Provider>;
  if (reducedMotion === "always") {
    content = (
      <div data-cennge-motion="reduce" style={{ display: "contents" }}>
        {content}
      </div>
    );
  }

  return <DefaultsContext.Provider value={defaults}>{content}</DefaultsContext.Provider>;
}
