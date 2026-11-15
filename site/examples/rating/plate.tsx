"use client";

import { useState } from "react";
import { Rating } from "cennge-ui";

// Ratings other people gave before you.
const others = [5, 4, 4, 5, 3];

export default function RatingPlate() {
  const [mine, setMine] = useState(0);
  const [docs, setDocs] = useState(3.5);

  const all = mine > 0 ? [...others, mine] : others;
  const average = Math.round((all.reduce((sum, value) => sum + value, 0) / all.length) * 10) / 10;

  return (
    <div className="flex w-full max-w-xl flex-col gap-7">
      <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
        <Rating
          label="Rate payload-cache"
          value={mine}
          onValueChange={setMine}
          size="lg"
          description={mine > 0 ? `You gave it ${mine} of 5` : "Not rated yet"}
        />
        <Rating
          label="Docs quality"
          allowHalf
          value={docs}
          onValueChange={setDocs}
          size="lg"
          description={docs > 0 ? `${docs} of 5, in half stars` : "Not rated yet"}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-medium bg-surface-3 px-4 py-3 text-sm">
        <Rating isReadOnly value={average} aria-label="Average rating" size="sm" />
        <span>
          <span className="font-semibold tabular-nums">{average.toFixed(1)}</span>
          <span className="text-muted"> average from {all.length} ratings</span>
        </span>
      </div>
    </div>
  );
}
