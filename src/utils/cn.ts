import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge has to know about the custom theme keys from styles.css,
 * otherwise `rounded-small` and `rounded-large` would both survive a merge.
 */
export const twMergeConfig = {
  extend: {
    theme: {
      radius: ["small", "medium", "large"],
      shadow: ["raised", "floating"],
      "inset-shadow": ["tactile"],
      ease: ["tactile"],
      font: ["cennge"],
    },
  },
};

const twMerge = extendTailwindMerge(twMergeConfig);

/** Join class names and resolve Tailwind conflicts, last one wins. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
