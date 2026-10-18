import { createTV } from "tailwind-variants";
import { twMergeConfig } from "./cn";

/** tailwind-variants preconfigured with the same merge rules as `cn()`. */
export const tv = createTV({ twMergeConfig });

export type { VariantProps } from "tailwind-variants";
