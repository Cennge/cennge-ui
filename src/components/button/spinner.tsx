import type { CenngeSize } from "../../types";

const sizes: Record<CenngeSize, string> = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

export function Spinner({ size = "md" }: { size?: CenngeSize }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={`${sizes[size]} shrink-0 animate-spin motion-reduce:animate-[spin_1.5s_linear_infinite]`}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
