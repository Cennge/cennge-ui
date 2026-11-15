"use client";

import { Rating } from "cennge-ui";

export default function AverageRating() {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Rating isReadOnly value={4.3} aria-label="Average rating" size="sm" />
      <span className="font-semibold tabular-nums">4.3</span>
      <span className="text-muted">ai-niche-scout</span>
    </div>
  );
}
