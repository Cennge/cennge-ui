"use client";

import { useState } from "react";
import { Rating } from "cennge-ui";

export default function RateRelease() {
  const [stars, setStars] = useState(0);
  return (
    <Rating
      label="Rate cennge-ui 0.3.1"
      value={stars}
      onValueChange={setStars}
      description={stars === 0 ? "value is 0: no rating" : `value is ${stars}`}
    />
  );
}
