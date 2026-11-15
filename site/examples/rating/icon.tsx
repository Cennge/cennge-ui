"use client";

import { Rating } from "cennge-ui";

const HEART = "M12 20.5s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.5-7.5 10.1-7.5 10.1Z";

function Heart({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="block size-full">
      <path d={HEART} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.75} strokeLinejoin="round" />
    </svg>
  );
}

export default function FavouriteRating() {
  return (
    <Rating
      label="How much do you like spredo-crypto-screener?"
      count={3}
      icon={<Heart filled />}
      emptyIcon={<Heart />}
      color="danger"
      defaultValue={2}
      getValueLabel={(value) => (value === 0 ? "No hearts" : `${value} ${value === 1 ? "heart" : "hearts"}`)}
    />
  );
}
